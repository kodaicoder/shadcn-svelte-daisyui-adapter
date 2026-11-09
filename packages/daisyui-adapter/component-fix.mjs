// The fixer reads the project's own files, so the installed shadcn-svelte version is parsed at this
// boundary before any byte is written.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

import {
	ALL_SITES,
	COMPONENTS,
	CREATES,
	KNOWN_COMPONENTS,
	PAIRS,
	SITES,
	SUPPORTED
} from './targets.mjs';

export { COMPONENTS, PAIRS, SITES, SUPPORTED };

// A `#` alias is a package.json subpath import and can point anywhere, so the project's own
// `imports` map wins over the convention below. `$lib` is SvelteKit's fixed lib alias; `@/` and
// `~/` are the src-relative forms shadcn writes.
const readImports = (root) => {
	const path = join(root, 'package.json');
	if (!existsSync(path)) return [];
	return Object.entries(JSON.parse(readFileSync(path, 'utf8')).imports ?? {})
		.filter(
			([key, value]) => key.endsWith('/*') && typeof value === 'string' && value.endsWith('/*')
		)
		.sort(([a], [b]) => b.length - a.length);
};

const resolveAlias = (alias, root) => {
	for (const [key, value] of readImports(root)) {
		const prefix = key.slice(0, -2);
		if (alias !== prefix && !alias.startsWith(`${prefix}/`)) continue;
		return resolve(root, value.slice(0, -1), alias.slice(prefix.length).replace(/^[/\\]/, ''));
	}
	const lib = (rest) => resolve(root, 'src', 'lib', rest.replace(/^[/\\]/, ''));
	if (alias === '$lib' || alias.startsWith('$lib/')) return lib(alias.slice(4));
	if (alias === '#lib' || alias.startsWith('#lib/')) return lib(alias.slice(4));
	if (alias.startsWith('@/')) return resolve(root, 'src', alias.slice(2));
	if (alias.startsWith('~/')) return resolve(root, 'src', alias.slice(2));
	if (isAbsolute(alias) || alias.startsWith('.')) return resolve(root, alias);
	return resolve(root, 'src', alias);
};

export function uiDirectory(componentsJson = {}, root = process.cwd()) {
	const aliases = componentsJson.aliases ?? {};
	if (!aliases.ui && !aliases.components) return resolve(root, 'src', 'lib', 'components', 'ui');
	return resolveAlias(aliases.ui ?? `${aliases.components}/ui`, root);
}

const readJson = (path) => {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return null;
	}
};

// shadcn-svelte is usually run through `dlx`, so a project often has no dependency entry at all. The
// installed manifest is authoritative; the range in package.json is the fallback. A version that
// cannot be read warns once and continues, because refusing would break those projects for no gain.
const installedVersion = (root) => {
	const manifest = readJson(join(root, 'node_modules', 'shadcn-svelte', 'package.json'));
	if (typeof manifest?.version === 'string') return manifest.version;
	const project = readJson(join(root, 'package.json')) ?? {};
	const range =
		project.dependencies?.['shadcn-svelte'] ?? project.devDependencies?.['shadcn-svelte'];
	return typeof range === 'string' ? range : null;
};

let versionWarned = false;
const warnUnknownVersion = () => {
	if (versionWarned) return;
	versionWarned = true;
	console.warn(
		'[daisyui-adapter] cannot read the installed shadcn-svelte version; continuing without the version guard'
	);
};

const guard = ({ root, scope, directory }) => {
	const present = [...new Set(scope.map((site) => site.file))].some((file) =>
		existsSync(join(directory, ...file.split('/')))
	);
	if (!present) return;

	const raw = installedVersion(root);
	const parsed = raw ? /(\d+)\.(\d+)\.(\d+)/.exec(raw) : null;
	if (!parsed) {
		warnUnknownVersion();
		return;
	}
	const { major, minor } = SUPPORTED.version;
	if (Number(parsed[1]) !== major || Number(parsed[2]) !== minor) {
		throw new Error(
			`[daisyui-adapter] unsupported shadcn-svelte version ${parsed[0]}; this adapter fixes ${major}.${minor}.x`
		);
	}
};

const stateOf = (content, site) => {
	if (site.position === 'insert') {
		const at = content.indexOf(site.stock);
		if (at < 0) return content.includes(site.fixed) ? 'fixed' : 'customized';
		if (content.indexOf(site.stock, at + 1) >= 0) return 'customized';
		const stockAt = site.fixed.indexOf(site.stock);
		const before = stockAt < 0 ? '' : site.fixed.slice(0, stockAt);
		const after = stockAt < 0 ? '' : site.fixed.slice(stockAt + site.stock.length);
		const head = before === '' || content.slice(Math.max(0, at - before.length), at) === before;
		const tail = after === '' || content.startsWith(after, at + site.stock.length);
		if (head && tail) return 'fixed';
		return 'stock';
	}
	if (site.position !== 'replace') {
		throw new Error(`[daisyui-adapter] unknown site position "${site.position}"`);
	}
	if (site.stock === site.fixed) return content.includes(site.stock) ? 'fixed' : 'customized';
	if (content.includes(site.stock)) return 'stock';
	return content.includes(site.fixed) ? 'fixed' : 'customized';
};

const applySite = (content, site) => {
	if (site.position === 'replace') {
		return site.stock === site.fixed ? content : content.split(site.stock).join(site.fixed);
	}
	const at = content.indexOf(site.stock);
	if (at < 0 || content.indexOf(site.stock, at + 1) >= 0) return content;
	return `${content.slice(0, at)}${site.fixed}${content.slice(at + site.stock.length)}`;
};

const targetSites = (names) => {
	if (names.length === 0) return ALL_SITES;
	for (const name of names) {
		if (!KNOWN_COMPONENTS.includes(name)) {
			throw new Error(
				`[daisyui-adapter] unknown fix target "${name}". Known targets: ${KNOWN_COMPONENTS.join(', ')}`
			);
		}
	}
	return ALL_SITES.filter((site) => names.includes(site.component));
};

// Every target file is read once, because the fully fixed count covers both tables even when the run
// edits one. Only the reported scope is patched and written; the rest is counted from disk.
const run = ({ root = process.cwd(), components, names = [], dryRun = false }, write) => {
	const directory = uiDirectory(components, root);
	const scope = targetSites(names);
	guard({ root, scope, directory });

	const scopeFiles = new Set(scope.map((site) => site.file));
	const files = new Map();
	for (const site of ALL_SITES) {
		const group = files.get(site.file) ?? [];
		group.push(site);
		files.set(site.file, group);
	}

	// A radius component the project never installed is not a gap, and reporting every form-control
// file as missing would inflate the missing count of every project that uses only some components.
// A named component always reports its rows, and a site whose directory exists but whose file is
// gone is a real missing file.
const reportMissing = (site) =>
		names.length > 0 ||
		SITES.includes(site) ||
		existsSync(join(directory, ...site.file.split('/').slice(0, -1)));

	const apply = write && !dryRun;
	const sites = [];
	let fullyFixed = 0;

	for (const [file, group] of files) {
		const path = join(directory, ...file.split('/'));
		if (!existsSync(path)) {
			if (scopeFiles.has(file)) {
				for (const site of group) {
					if (!reportMissing(site)) continue;
					sites.push({
						id: site.id,
						component: site.component,
						file,
						state: 'missing',
						written: false
					});
				}
			}
			continue;
		}

		const raw = readFileSync(path, 'utf8');
		const crlf = raw.includes('\r\n');
		let content = crlf ? raw.replace(/\r\n/g, '\n') : raw;
		const states = group.map((site) => ({ site, state: stateOf(content, site), written: false }));

		if (apply && scopeFiles.has(file)) {
			for (const entry of states) {
				if (entry.state !== 'stock') continue;
				const next = applySite(content, entry.site);
				if (next === content) continue;
				content = next;
				entry.written = true;
			}
			if (states.some((entry) => entry.written)) {
				writeFileSync(path, crlf ? content.replace(/\n/g, '\r\n') : content);
			}
		}

		if (scopeFiles.has(file)) {
			for (const entry of states) {
				sites.push({
					id: entry.site.id,
					component: entry.site.component,
					file,
					state: entry.state,
					written: entry.written
				});
			}
		}

		if (group.every((site) => stateOf(content, site) === 'fixed')) fullyFixed += 1;
	}

	const creates = [];
	for (const entry of CREATES) {
		const needed = entry.components.some((component) =>
			ALL_SITES.some(
				(site) =>
					site.component === component &&
					existsSync(join(directory, ...site.file.split('/')))
			)
		);
		if (!needed) continue;
		const path = join(directory, ...entry.file.split('/'));
		const present = existsSync(path);
		const written = apply && !present;
		if (written) {
			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(path, entry.content);
		}
		creates.push({ file: entry.file, present, written });
	}

	const counts = { stock: 0, fixed: 0, customized: 0, missing: 0 };
	for (const site of sites) counts[site.state] += 1;
	return { sites, counts, fullyFixed, creates };
};

export function scan(options = {}) {
	return run(options, false);
}

export function fix(options = {}) {
	return run(options, true);
}

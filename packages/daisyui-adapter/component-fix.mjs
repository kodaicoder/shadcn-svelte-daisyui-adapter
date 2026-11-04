// The fixer reads the project's own files, so the installed shadcn-svelte version is parsed at this
// boundary before any byte is written.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

import {
	COMPONENTS,
	KNOWN_COMPONENTS,
	PAIRS,
	RADIUS,
	SITES,
	SUPPORTED,
	SURFACES
} from './targets.mjs';

export { COMPONENTS, PAIRS, SITES, SUPPORTED };

const ALL_SITES = [...SITES, ...RADIUS, ...SURFACES];

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
	if (content.includes(site.fixed)) return 'fixed';
	if (content.includes(site.stock)) return 'stock';
	return 'customized';
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
				content = content.split(entry.site.stock).join(entry.site.fixed);
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

	const counts = { stock: 0, fixed: 0, customized: 0, missing: 0 };
	for (const site of sites) counts[site.state] += 1;
	return { sites, counts, fullyFixed };
};

export function scan(options = {}) {
	return run(options, false);
}

export function fix(options = {}) {
	return run(options, true);
}

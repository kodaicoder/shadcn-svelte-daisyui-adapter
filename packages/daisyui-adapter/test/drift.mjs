// Runs from the repo root with no install step: it reads the pinned stock components that are
// committed under `src/lib/components/ui`, so a dependency bump that rewrites a class fails here
// before the manifest can drift past a user's machine.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	ALL_SITES,
	BINARY_COMPONENTS,
	BINARY_SITES,
	COMPONENTS,
	CURSOR_COMPONENTS,
	CURSOR_SITES,
	FIELD_VARIANT_COMPONENTS,
	FIELD_VARIANTS,
	KNOWN_COMPONENTS,
	PAIRS,
	RADIUS,
	RADIUS_COMPONENTS,
	RING_COMPONENTS,
	RINGS,
	SITES,
	SIZE_COMPONENTS,
	SIZES,
	SUPPORTED,
	SURFACES,
	SURFACE_COMPONENTS,
	VARIANTS,
	VARIANT_COMPONENTS,
	VARIANT_ROWS
} from '../targets.mjs';
import { applySite, scan } from '../component-fix.mjs';
import { shiftRungs } from '../targets/type-scale.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const UI = join(ROOT, 'src', 'lib', 'components', 'ui');
const COMPONENT_DIR = join(ROOT, 'src', 'lib', 'components');

const firstDifference = (want, got) => {
	const wanted = want.split('\n');
	const actual = got.split('\n');
	let line = 0;
	while (line < wanted.length && wanted[line] === actual[line]) line += 1;
	const from = wanted[line] ?? '';
	const to = actual[line] ?? '';
	let at = 0;
	while (at < from.length && from[at] === to[at]) at += 1;
	const window = (text) => text.slice(Math.max(0, at - 20), at + 60);
	return `line ${line + 1} col ${at + 1} wants ${JSON.stringify(window(from))} got ${JSON.stringify(window(to))}`;
};

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const readJson = (path) => {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return null;
	}
};

check('the manifest names nine components', COMPONENTS.length === 9, `${COMPONENTS.length}`);
check('the manifest holds eleven sites', SITES.length === 11, `${SITES.length}`);
check('the manifest holds ten pairs', PAIRS.length === 10, `${PAIRS.length}`);

const siteIds = new Set(SITES.map((site) => site.id));
check(
	'every pair site id exists',
	PAIRS.every((pair) => pair.sites.every((id) => siteIds.has(id))),
	PAIRS.flatMap((pair) => pair.sites)
		.filter((id) => !siteIds.has(id))
		.join(', ')
);
const positioned = ALL_SITES.filter(
	(site) => site.position !== 'replace' && site.position !== 'insert'
);
check(
	'every site declares a position',
	positioned.length === 0,
	positioned.map((site) => site.id).join(', ')
);
const unnestedInserts = ALL_SITES.filter(
	(site) => site.position === 'insert' && !site.fixed.includes(site.stock)
);
check(
	'every insert site nests its stock in its fixed',
	unnestedInserts.length === 0,
	unnestedInserts.map((site) => site.id).join(', ')
);
// The fixer tells a fixed replace site from a stock one by which string the file holds, so a fixed
// that still contains its stock reads back as stock forever.
const nestedReplaces = ALL_SITES.filter(
	(site) =>
		site.position === 'replace' && site.stock !== site.fixed && site.fixed.includes(site.stock)
);
check(
	'no replace site hides its stock inside its fixed',
	nestedReplaces.length === 0,
	nestedReplaces.map((site) => site.id).join(', ')
);
check(
	'the manifest holds twenty-five binary sites',
	BINARY_SITES.length === 25,
	`${BINARY_SITES.length}`
);
check('the manifest holds four ring sites', RINGS.length === 4, `${RINGS.length}`);
check('the manifest holds nine cursor sites', CURSOR_SITES.length === 9, `${CURSOR_SITES.length}`);
check('the manifest holds sixteen size sites', SIZES.length === 16, `${SIZES.length}`);
const sizeCoupling = SIZES.filter(
	(site) => site.fixed.includes('rounded-') || site.stock.includes('rounded-')
);
check(
	'no size site crosses the radius anchor',
	sizeCoupling.length === 0,
	sizeCoupling.map((site) => site.id).join(', ')
);
// The smallest component rung is 12px; `text-xs` is the rung below it.
const TEXT_XS = /\btext-xs\b/;
const onXs = [
	...ALL_SITES.filter((site) => TEXT_XS.test(site.fixed)).map((site) => site.id),
	...VARIANT_ROWS.filter((row) => TEXT_XS.test(row.class)).map((row) => `${row.component}:${row.key}`)
];
const copies = readdirSync(COMPONENT_DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && entry.name.endsWith('-fixed'))
	.flatMap((entry) =>
		readdirSync(join(COMPONENT_DIR, entry.name))
			// The fixer never writes a story; a story beside its component is docs, not a copy.
			.filter((file) => file.endsWith('.svelte') && !file.endsWith('.stories.svelte'))
			.map((file) => ({ dir: entry.name, file }))
	);
for (const { dir, file } of copies) {
	const text = readFileSync(join(COMPONENT_DIR, dir, file), 'utf8');
	if (TEXT_XS.test(text)) onXs.push(`${dir}/${file}`);
}
check('no fixed string, variant row, or fixed copy names text-xs', onXs.length === 0, onXs.join(', '));

const copyDrift = [];
for (const { dir, file } of copies) {
	const component = dir.slice(0, -6);
	const source = join(UI, component, file);
	if (!existsSync(source)) {
		copyDrift.push(`${dir}/${file}: ui/${component}/${file} is missing`);
		continue;
	}
	let expected = readFileSync(source, 'utf8').replace(/\r\n/g, '\n');
	for (const site of ALL_SITES) {
		if (site.file === `${component}/${file}`) expected = applySite(expected, site);
	}
	const copy = readFileSync(join(COMPONENT_DIR, dir, file), 'utf8').replace(/\r\n/g, '\n');
	if (copy !== expected) copyDrift.push(`${dir}/${file}: ${firstDifference(expected, copy)}`);
}
check(
	'every fixed copy is what the manifest produces from the pin',
	copyDrift.length === 0,
	copyDrift.join(' | ')
);

check(
	'the manifest holds twenty-seven field variant sites',
	FIELD_VARIANTS.length === 27,
	`${FIELD_VARIANTS.length}`
);
check(
	'every field variant site belongs to a field component',
	FIELD_VARIANTS.every((site) => FIELD_VARIANT_COMPONENTS.includes(site.component)),
	FIELD_VARIANTS.filter((site) => !FIELD_VARIANT_COMPONENTS.includes(site.component))
		.map((site) => site.id)
		.join(', ')
);
const fieldRadiusCoupling = FIELD_VARIANTS.filter(
	(site) => site.fixed.includes('rounded-') || site.stock.includes('rounded-')
);
check(
	'no field variant site crosses the radius anchor',
	fieldRadiusCoupling.length === 0,
	fieldRadiusCoupling.map((site) => site.id).join(', ')
);
check(
	'every size site belongs to a size component',
	SIZES.every((site) => SIZE_COMPONENTS.includes(site.component)),
	SIZES.filter((site) => !SIZE_COMPONENTS.includes(site.component))
		.map((site) => site.id)
		.join(', ')
);
check(
	'every site belongs to a named component of its own table',
	SITES.every((site) => COMPONENTS.includes(site.component)) &&
		BINARY_SITES.every((site) => BINARY_COMPONENTS.includes(site.component)) &&
		CURSOR_SITES.every((site) => CURSOR_COMPONENTS.includes(site.component)) &&
		RADIUS.every((site) => RADIUS_COMPONENTS.includes(site.component)) &&
		RINGS.every((site) => RING_COMPONENTS.includes(site.component)) &&
		SURFACES.every((site) => SURFACE_COMPONENTS.includes(site.component)) &&
		VARIANTS.every((site) => VARIANT_COMPONENTS.includes(site.component))
);

// A component name is not always a directory: input-group-button is a file inside input-group. A
// component with a site is checked through that file; a site-less name (radio-group) is a directory.
const firstSite = new Map();
for (const site of ALL_SITES) {
	if (!firstSite.has(site.component)) firstSite.set(site.component, site);
}
const missingComponents = KNOWN_COMPONENTS.filter((name) => {
	const site = firstSite.get(name);
	return site ? !existsSync(join(UI, ...site.file.split('/'))) : !existsSync(join(UI, name));
});
check(
	'every component directory exists under the pinned ui directory',
	missingComponents.length === 0,
	missingComponents.join(', ')
);

// A later table may target text that an earlier one just wrote, so each site is checked against the
// content its turn sees, in the same file order and site order the fixer uses.
const fileGroups = new Map();
for (const site of ALL_SITES) {
	const group = fileGroups.get(site.file) ?? [];
	group.push(site);
	fileGroups.set(site.file, group);
}

const missingStock = [];
for (const [file, group] of fileGroups) {
	const path = join(UI, ...file.split('/'));
	if (!existsSync(path)) {
		missingStock.push(...group.map((site) => site.id));
		continue;
	}
	let content = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
	for (const site of group) {
		if (!content.includes(site.stock)) missingStock.push(site.id);
		content = applySite(content, site);
	}
}
check(
	'every site still finds its stock in its turn',
	missingStock.length === 0,
	missingStock.join(', ')
);

// The fixer classifies every site before it writes, so a stock an earlier site creates reads
// customized on the pin (ticket 73).
const cleanTextarea = scan({ root: ROOT, names: ['textarea'] });
const customized = cleanTextarea.sites.filter((site) => site.state === 'customized');
const readonly = cleanTextarea.sites.find((site) => site.id === 'textarea-readonly-surface');
check(
	'the clean textarea pin reports all 15 sites stock',
	customized.length === 0 &&
		cleanTextarea.counts.stock === 15 &&
		cleanTextarea.counts.missing === 0 &&
		readonly?.state === 'stock',
	`${customized.length} customized, ${cleanTextarea.counts.stock} stock, ${cleanTextarea.counts.missing} missing, readonly ${readonly?.state}`
);

const RUNG = /text-(?:xs|sm|base|lg|xl|2xl)(?![a-z0-9-])/;
const unnamedRungs = [];
const walkUi = (directory) =>
	readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) return walkUi(join(directory, entry.name));
		return entry.name.endsWith('.svelte') ? [join(directory, entry.name)] : [];
	});
for (const path of walkUi(UI)) {
	const file = path.slice(UI.length + 1).replaceAll(sep, '/');
	if (fileGroups.has(file)) continue;
	if (RUNG.test(readFileSync(path, 'utf8'))) unnamedRungs.push(file);
}
check(
	'no ui file keeps a rung the manifest does not name',
	unnamedRungs.length === 0,
	unnamedRungs.join(', ')
);

const shiftDrift = [];
for (const [file, group] of fileGroups) {
	const path = join(UI, ...file.split('/'));
	if (!existsSync(path)) continue;
	const stock = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
	let current = stock;
	let target = shiftRungs(stock);
	for (const site of group) {
		current = applySite(current, site);
		target = applySite(target, { ...site, stock: shiftRungs(site.stock) });
	}
	if (current !== target) shiftDrift.push(`${file}: ${firstDifference(target, current)}`);
}
check(
	'every stock rung the tables leave alone is shifted one step up',
	shiftDrift.length === 0,
	shiftDrift.join(' | ')
);

const shadcnVersion = () => {
	const installed = readJson(join(ROOT, 'node_modules', 'shadcn-svelte', 'package.json'));
	if (typeof installed?.version === 'string') return installed.version;
	const project = readJson(join(ROOT, 'package.json')) ?? {};
	const range =
		project.dependencies?.['shadcn-svelte'] ?? project.devDependencies?.['shadcn-svelte'];
	return typeof range === 'string' ? range : null;
};
const rawVersion = shadcnVersion();
const parsed = rawVersion ? /(\d+)\.(\d+)\.(\d+)/.exec(rawVersion) : null;
check(
	`the installed shadcn-svelte is ${SUPPORTED.version.major}.${SUPPORTED.version.minor}.x`,
	parsed !== null &&
		Number(parsed[1]) === SUPPORTED.version.major &&
		Number(parsed[2]) === SUPPORTED.version.minor,
	rawVersion ?? 'not found'
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? 'all drift checks passed' : `${failed.length} drift check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;

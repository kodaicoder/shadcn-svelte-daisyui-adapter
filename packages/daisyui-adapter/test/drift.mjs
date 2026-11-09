// Runs from the repo root with no install step: it reads the pinned stock components that are
// committed under `src/lib/components/ui`, so a dependency bump that rewrites a class fails here
// before the manifest can drift past a user's machine.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	ALL_SITES,
	BINARY_COMPONENTS,
	BINARY_SITES,
	COMPONENTS,
	CURSOR_COMPONENTS,
	CURSOR_SITES,
	KNOWN_COMPONENTS,
	PAIRS,
	RADIUS,
	RADIUS_COMPONENTS,
	SITES,
	SUPPORTED,
	SURFACES,
	SURFACE_COMPONENTS,
	VARIANTS,
	VARIANT_COMPONENTS
} from '../targets.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const UI = join(ROOT, 'src', 'lib', 'components', 'ui');

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
check(
	'the manifest holds twenty-four binary sites',
	BINARY_SITES.length === 24,
	`${BINARY_SITES.length}`
);
check('the manifest holds eight cursor sites', CURSOR_SITES.length === 8, `${CURSOR_SITES.length}`);
check(
	'every site belongs to a named component of its own table',
	SITES.every((site) => COMPONENTS.includes(site.component)) &&
		BINARY_SITES.every((site) => BINARY_COMPONENTS.includes(site.component)) &&
		CURSOR_SITES.every((site) => CURSOR_COMPONENTS.includes(site.component)) &&
		RADIUS.every((site) => RADIUS_COMPONENTS.includes(site.component)) &&
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

const missingStock = ALL_SITES.filter((site) => {
	const path = join(UI, ...site.file.split('/'));
	if (!existsSync(path)) return true;
	const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
	return !text.includes(site.stock);
}).map((site) => site.id);
check(
	'every site file still holds its stock string',
	missingStock.length === 0,
	missingStock.join(', ')
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

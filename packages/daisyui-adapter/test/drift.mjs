// Runs from the repo root with no install step: it reads the pinned stock components that are
// committed under `src/lib/components/ui`, so a dependency bump that rewrites a class fails here
// before the manifest can drift past a user's machine.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPONENTS, PAIRS, SITES, SUPPORTED } from '../targets.mjs';

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
check(
	'every site belongs to a named component',
	SITES.every((site) => COMPONENTS.includes(site.component))
);

const missingComponents = COMPONENTS.filter((name) => !existsSync(join(UI, name)));
check(
	'every component directory exists under the pinned ui directory',
	missingComponents.length === 0,
	missingComponents.join(', ')
);

const missingStock = SITES.filter((site) => {
	const path = join(UI, ...site.file.split('/'));
	return !existsSync(path) || !readFileSync(path, 'utf8').includes(site.stock);
}).map((site) => site.id);
check(
	'every site file still holds its stock string',
	missingStock.length === 0,
	missingStock.join(', ')
);

const componentsJson = readJson(join(ROOT, 'components.json'));
check(
	`the repo components.json style is ${SUPPORTED.style}`,
	componentsJson?.style === SUPPORTED.style,
	componentsJson?.style ?? 'none'
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

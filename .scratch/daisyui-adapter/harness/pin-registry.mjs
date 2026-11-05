// Builds a shadcn-svelte registry from the repo's pinned components, so the harness adds exactly the
// stock the fixer was written against. The live registry has moved past the pin; adding from it makes
// every site `customized` and proves nothing about the supported stock.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { KNOWN_COMPONENTS } from '../../../packages/daisyui-adapter/targets.mjs';

const REPO = join(import.meta.dirname, '..', '..', '..');
const MANIFEST = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'));
const RANGES = { ...MANIFEST.dependencies, ...MANIFEST.devDependencies };

// A file inside another item, not a registry item of its own.
// The fixer's targets plus the components the evidence page needs but the fixer does not touch.
export const REGISTRY_ITEMS = [
	...KNOWN_COMPONENTS.filter((name) => name !== 'input-group-button'),
	'tooltip',
	'label'
];

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? walk(path) : [path];
	});

const packageOf = (spec) =>
	spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];

const isLocal = (spec) =>
	spec.startsWith('.') || spec.startsWith('$app') || spec.startsWith('$env');
const isCore = (spec) => spec === 'svelte' || spec.startsWith('svelte/');

export const buildPinRegistry = (outDir) => {
	const uiDir = join(REPO, 'src', 'lib', 'components', 'ui');
	mkdirSync(outDir, { recursive: true });
	const index = [];

	for (const name of REGISTRY_ITEMS) {
		const dir = join(uiDir, name);
		const files = walk(dir)
			.sort()
			.map((path) => ({
				type: 'registry:file',
				target: `${name}/${relative(dir, path).replaceAll('\\', '/')}`,
				content: readFileSync(path, 'utf8')
			}));

		const dependencies = new Set();
		const registryDependencies = new Set();
		for (const file of files) {
			for (const match of file.content.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)) {
				const spec = match[1];
				if (spec.startsWith('#')) {
					const local = /^#lib\/components\/ui\/([^/]+)/.exec(spec);
					if (local && local[1] !== name && REGISTRY_ITEMS.includes(local[1])) {
						registryDependencies.add(local[1]);
					}
					continue;
				}
				if (isLocal(spec) || isCore(spec)) continue;
				const pkg = packageOf(spec);
				dependencies.add(RANGES[pkg] ? `${pkg}@${RANGES[pkg]}` : pkg);
			}
		}

		const item = {
			$schema: 'https://shadcn-svelte.com/schema/registry-item.json',
			name,
			type: 'registry:ui',
			...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
			...(registryDependencies.size > 0
				? { registryDependencies: [...registryDependencies].sort() }
				: {}),
			files
		};
		writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(item, null, 2)}\n`);
		index.push({
			name,
			type: 'registry:ui',
			registryDependencies: [...registryDependencies].sort(),
			relativeUrl: `${name}.json`
		});
	}

	writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
	return { items: REGISTRY_ITEMS.length, names: REGISTRY_ITEMS };
};

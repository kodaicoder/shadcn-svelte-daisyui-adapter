// Adds the raw-name item to registry.json by cloning the settled item, so the two fixtures differ
// in exactly two places: the plugin package and the item name.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(import.meta.dirname, 'registry.json');
const registry = JSON.parse(readFileSync(path, 'utf8'));
const base = registry.items.find((item) => item.name === 'daisyui-adapter');
const raw = structuredClone(base);
raw.name = 'daisyui-adapter-raw';
raw.title = 'daisyui-adapter-raw';
raw.description = 'Ticket 14 fixture: the same css carrier, with a plugin that also emits raw --color-* names.';
raw.devDependencies = ['daisyui-adapter-14-raw-probe@file:./daisyui-adapter-14-raw-probe-0.0.0.tgz'];
raw.css = Object.fromEntries(
	Object.entries(raw.css).map(([key, value]) => [
		key === '@plugin "daisyui-adapter-14-probe"' ? '@plugin "daisyui-adapter-14-raw-probe"' : key,
		value
	])
);
registry.items = [
	base,
	raw,
	{
		name: 'noop',
		type: 'registry:lib',
		title: 'noop',
		description: 'Satisfies the harness `--then` precondition without writing anything, so a pure CLI run has no add.',
		dependencies: [],
		devDependencies: [],
		registryDependencies: [],
		files: []
	}
];

writeFileSync(path, `${JSON.stringify(registry, null, '\t')}\n`);
console.log(registry.items.map((item) => item.name).join(', '));

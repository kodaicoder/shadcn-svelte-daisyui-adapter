import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './serve-static.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const USAGE = 'usage: node scripts/check-build.mjs [--root <dir>] [--serve <port>]';

const outputDir = (root, name) => {
	const verify = resolve(root, '.verify');
	const dir = resolve(verify, 'docs-build', name);
	if (!dir.startsWith(verify + sep)) {
		console.error(`refusing to write outside ${verify}: ${dir}`);
		return null;
	}
	return dir;
};

const dispatcherPath = (root) => {
	const packageDir = join(root, 'node_modules', 'storybook');
	const packageJson = join(packageDir, 'package.json');
	const fallback = join(packageDir, 'dist', 'bin', 'dispatcher.js');
	if (!existsSync(packageJson)) return null;
	const bin = (() => {
		try {
			return JSON.parse(readFileSync(packageJson, 'utf8')).bin;
		} catch {
			return null;
		}
	})();
	const entry =
		typeof bin === 'string' ? bin : (bin?.storybook ?? Object.values(bin ?? {})[0] ?? null);
	const path = entry ? resolve(packageDir, entry) : fallback;
	return existsSync(path) ? path : null;
};

const readTree = (dir) => {
	const tree = new Map();
	if (!existsSync(dir)) return tree;
	const walk = (current) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const path = join(current, entry.name);
			if (entry.isDirectory()) walk(path);
			else tree.set(relative(dir, path).split(sep).join('/'), readFileSync(path));
		}
	};
	walk(dir);
	return tree;
};

const dropGeneratedAt = (value) => {
	if (!value || typeof value !== 'object') return 0;
	if (Array.isArray(value)) {
		return value.reduce((total, item) => total + dropGeneratedAt(item), 0);
	}
	let removed = 0;
	for (const key of Object.keys(value)) {
		if (key === 'generatedAt') {
			delete value[key];
			removed += 1;
			continue;
		}
		removed += dropGeneratedAt(value[key]);
	}
	return removed;
};

const normalise = (tree) => {
	let fields = 0;
	let files = 0;
	for (const [path, bytes] of tree) {
		if (basename(path) !== 'project.json') continue;
		let data;
		try {
			data = JSON.parse(bytes.toString('utf8'));
		} catch {
			continue;
		}
		const removed = dropGeneratedAt(data);
		if (removed === 0) continue;
		tree.set(path, Buffer.from(JSON.stringify(data)));
		fields += removed;
		files += 1;
	}
	return { fields, files };
};

const firstJsonDifference = (left, right, at) => {
	if (left === right) return null;
	const both = left && right && typeof left === 'object' && typeof right === 'object';
	if (!both) return [at || '(root)', left, right];
	const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
	for (const key of keys) {
		const found = firstJsonDifference(left[key], right[key], at ? `${at}.${key}` : key);
		if (found) return found;
	}
	return null;
};

const firstDifference = (left, right) => {
	const a = left.toString('utf8');
	const b = right.toString('utf8');
	try {
		const found = firstJsonDifference(JSON.parse(a), JSON.parse(b), '');
		if (found) {
			const [key, from, to] = found;
			return `${key}  a=${JSON.stringify(from)}  b=${JSON.stringify(to)}`;
		}
	} catch {
		// Not JSON, so the byte window below is the more useful detail.
	}
	let index = 0;
	while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
	return `byte ${index}  a=${JSON.stringify(a.slice(index, index + 40))}  b=${JSON.stringify(b.slice(index, index + 40))}`;
};

const compare = (a, b) => {
	const differences = [];
	for (const [path, bytes] of a) {
		if (!b.has(path)) {
			differences.push(`${path}  only in a`);
			continue;
		}
		if (!bytes.equals(b.get(path)))
			differences.push(`${path}  ${firstDifference(bytes, b.get(path))}`);
	}
	for (const path of b.keys()) if (!a.has(path)) differences.push(`${path}  only in b`);
	return differences.sort();
};

const digest = (tree) => {
	const lines = [...tree.keys()]
		.sort()
		.map((path) => `${path}\0${createHash('sha256').update(tree.get(path)).digest('hex')}\n`);
	return `sha256:${createHash('sha256').update(lines.join('')).digest('hex')}`;
};

const addonCache = (root) => resolve(root, 'node_modules', '.cache', 'storybook');

// Storybook caches prebuilt addon manager bundles here, and a cached bundle records the checkout
// that built it, so a build that inherits a cache from another checkout differs from a clean one.
const build = (root, dispatcher, dir) => {
	rmSync(dir, { recursive: true, force: true });
	rmSync(addonCache(root), { recursive: true, force: true });
	const result = spawnSync(process.execPath, [dispatcher, 'build', '-o', dir], {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});
	if (result.error) {
		console.error(`cannot start storybook: ${result.error.message}`);
		return 2;
	}
	if (result.status !== 0) {
		const log = `${result.stdout ?? ''}${result.stderr ?? ''}`.trimEnd().split('\n');
		console.error(log.slice(-20).join('\n'));
		console.error(`storybook build failed for ${dir} (exit ${result.status ?? result.signal})`);
		return 1;
	}
	return 0;
};

const main = () => {
	const argv = process.argv.slice(2);
	let root = ROOT;
	let servePort = null;
	for (let index = 0; index < argv.length; index += 1) {
		const flag = argv[index];
		if (flag !== '--root' && flag !== '--serve') {
			console.error(`unknown argument: ${flag}\n${USAGE}`);
			return 2;
		}
		const value = argv[index + 1];
		if (!value) {
			console.error(`${flag} needs a value\n${USAGE}`);
			return 2;
		}
		if (flag === '--root') root = resolve(value);
		else {
			servePort = Number(value);
			if (!Number.isInteger(servePort) || servePort < 1 || servePort > 65535) {
				console.error(`--serve needs a port between 1 and 65535\n${USAGE}`);
				return 2;
			}
		}
		index += 1;
	}

	const dispatcher = dispatcherPath(root);
	if (!dispatcher) {
		console.error(`storybook is not installed under ${root}/node_modules; run pnpm install first`);
		return 2;
	}

	const dirs = ['a', 'b'].map((name) => outputDir(root, name));
	if (dirs.some((dir) => dir === null)) return 2;

	const trees = [];
	for (const [index, dir] of dirs.entries()) {
		const status = build(root, dispatcher, dir);
		if (status !== 0) return status;
		const tree = readTree(dir);
		if (tree.size === 0) {
			console.error(`build ${'ab'[index]} wrote no files to ${dir}`);
			return 1;
		}
		trees.push(tree);
		console.log(`build ${'ab'[index]}  ${tree.size} files  ${dir}`);
	}

	const [a, b] = trees;
	const normalisedA = normalise(a);
	const normalisedB = normalise(b);
	const fields = normalisedA.fields + normalisedB.fields;
	const files = normalisedA.files + normalisedB.files;
	console.log(
		`normalised  project.json #generatedAt (${fields} field${fields === 1 ? '' : 's'}, ${files} file${files === 1 ? '' : 's'})`
	);

	const digestA = digest(a);
	const digestB = digest(b);
	console.log(`digest a  ${digestA}`);
	console.log(`digest b  ${digestB}`);

	const differences = compare(a, b);
	for (const difference of differences.slice(0, 10)) console.log(`  ${difference}`);
	if (differences.length > 10) console.log(`  ... and ${differences.length - 10} more`);

	const same = a.size === b.size && differences.length === 0 && digestA === digestB;
	console.log(`result  ${same ? 'identical' : 'not deterministic'}`);
	console.log(`open  ${dirs[0]}`);
	if (!same) {
		if (servePort !== null) console.log('serve  refused, the two builds differ');
		return 1;
	}
	if (servePort !== null) serve(dirs[0], servePort);
	return 0;
};

process.exitCode = main();

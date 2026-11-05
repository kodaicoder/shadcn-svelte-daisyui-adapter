import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';
import {
	contrastKnownLimits,
	contrastMatrix,
	contrastWarnings
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-37-warning');
const THEME = join(REPO, 'src', 'daisyui-theme.css');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const HARNESS = join(REPO, '.scratch', 'daisyui-adapter', 'harness');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;
const TONES = ['success', 'warning', 'info', 'destructive'];

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));
	writeFileSync(
		join(dir, 'components.json'),
		JSON.stringify({ tailwind: { css: 'src/routes/layout.css' }, style: 'mira' }, null, '\t')
	);
	// The CLI installs its own version when node_modules holds nothing, so these stubs keep the check
	// off the registry. The fixer's guard reads the installed shadcn-svelte, so it names the pin.
	const stub = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(stub), { recursive: true });
	writeFileSync(stub, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));
	const shadcn = join(dir, 'node_modules', 'shadcn-svelte', 'package.json');
	mkdirSync(dirname(shadcn), { recursive: true });
	writeFileSync(shadcn, JSON.stringify({ name: 'shadcn-svelte', version: '1.8.0' }, null, '\t'));
};

const cliResult = (dir) => {
	const result = spawnSync(process.execPath, [CLI], { cwd: dir, encoding: 'utf8' });
	return {
		code: result.status ?? 1,
		stdout: result.stdout ?? '',
		stderr: result.stderr ?? ''
	};
};

const themes = parseTheme(readFileSync(THEME, 'utf8'), THEME);
const matrix = contrastMatrix(themes);

for (const scheme of ['light', 'dark']) {
	const rows = matrix[scheme].pairs;
	check(
		`${scheme}: the ten repaired pairs are measured and pass`,
		rows.length === 10 && rows.every((row) => row.pass),
		`${rows.length} pairs, ${rows.filter((row) => !row.pass).length} below threshold`
	);
}

const toneRatios = (scheme) => matrix[scheme].textTones.map((row) => row.ratio);
const EXPECTED_TONES = {
	light: [7.37, 6.58, 8.29, 13.51],
	dark: [12.41, 12.72, 11.91, 8.26]
};
for (const scheme of ['light', 'dark']) {
	check(
		`${scheme}: the four text tones hold the pinned ratios and pass`,
		JSON.stringify(toneRatios(scheme)) === JSON.stringify(EXPECTED_TONES[scheme]) &&
			matrix[scheme].textTones.every((row) => row.pass),
		toneRatios(scheme).join(', ')
	);
}

const warnings = contrastWarnings(matrix).map(
	(row) => `${row.scheme} ${row.name} ${row.ratio} ${row.threshold}`
);
check(
	'the delivered theme raises no fill-text warning',
	warnings.length === 0,
	warnings.join(' | ') || 'none'
);

const limits = contrastKnownLimits(matrix).map((row) => `${row.scheme} ${row.name} ${row.ratio}`);
const EXPECTED_LIMITS = [
	'light success fill 1.96',
	'light warning fill 1.76',
	'light info fill 2.22',
	'dark destructive fill 2.89'
];
check(
	'exactly four known limits, naming the tone and the fill ratio',
	JSON.stringify(limits) === JSON.stringify(EXPECTED_LIMITS),
	limits.join(' | ') || 'none'
);

const project = join(WORK, 'app');
scaffold(project);
const run = cliResult(project);
check('the CLI exits 0 with a theme that reports limits', run.code === 0, `exit ${run.code}`);

const reportNames =
	matrix.light.pairs.every((row) => run.stdout.includes(row.name)) &&
	matrix.dark.pairs.every((row) => run.stdout.includes(row.name));
check('stdout names every pair in both schemes', reportNames);

const textToneLines = run.stdout.split(/\r?\n/).filter((line) => line.includes(']   text tones:'));
check(
	'stdout names every tone in both schemes',
	textToneLines.length === 2 &&
		textToneLines.every((line) => TONES.every((tone) => line.includes(`${tone} `))) &&
		run.stdout.includes('contrast light') &&
		run.stdout.includes('contrast dark'),
	`${textToneLines.length} text-tone line(s)`
);

const warningLines = (run.stderr.match(/^\[daisyui-adapter\] warning:/gm) ?? []).length;
const limitLines = (run.stderr.match(/^\[daisyui-adapter\] known limit:/gm) ?? []).length;
check('stderr holds no warning lines', warningLines === 0, `${warningLines}`);
check('stderr holds exactly four known-limit lines', limitLines === 4, `${limitLines}`);

const low = join(WORK, 'low');
scaffold(low);
const blocks = readFileSync(THEME, 'utf8').split(/(?=@plugin 'daisyui\/theme')/);
const accent = /--color-accent:\s*([^;]+);/.exec(blocks[0])[1].trim();
blocks[0] = blocks[0].replace(
	/--color-accent-content:\s*[^;]+;/,
	`--color-accent-content: ${accent};`
);
writeFileSync(join(low, 'src', 'daisyui-theme.css'), blocks.join(''));
const lowRun = cliResult(low);
check(
	'a theme that makes a repaired pair fail warns and still exits 0',
	lowRun.code === 0 &&
		/\[daisyui-adapter\] warning: light calendar hover is 1\.00:1, below 4\.50:1/.test(
			lowRun.stderr
		),
	`exit ${lowRun.code}, ${(lowRun.stderr.match(/warning:/g) ?? []).length} warning(s)`
);

const border = join(WORK, 'border');
scaffold(border);
const borderBlocks = readFileSync(THEME, 'utf8').split(/(?=@plugin 'daisyui\/theme')/);
const page = /--color-base-100:\s*([^;]+);/.exec(borderBlocks[0])[1].trim();
borderBlocks[0] = borderBlocks[0].replace(
	/--color-base-content:\s*[^;]+;/,
	`--color-base-content: ${page};`
);
writeFileSync(join(border, 'src', 'daisyui-theme.css'), borderBlocks.join(''));
const borderRun = cliResult(border);
check(
	'a text tone below 4.5 warns and still exits 0',
	borderRun.code === 0 &&
		/\[daisyui-adapter\] warning: light success text is \d+\.\d+:1, below 4\.50:1/.test(
			borderRun.stderr
		),
	`exit ${borderRun.code}, ${(borderRun.stderr.match(/text is/g) ?? []).length} text warning(s)`
);

const content = join(WORK, 'content');
scaffold(content);
const contentBlocks = readFileSync(THEME, 'utf8').split(/(?=@plugin 'daisyui\/theme')/);
const contentPage = /--color-base-100:\s*([^;]+);/.exec(contentBlocks[0])[1].trim();
contentBlocks[0] = contentBlocks[0].replace(
	/--color-warning-content:\s*[^;]+;/,
	`--color-warning-content: ${contentPage};`
);
writeFileSync(join(content, 'src', 'daisyui-theme.css'), contentBlocks.join(''));
const contentRun = cliResult(content);
check(
	'a tone content that fails its own fill warns and still exits 0',
	contentRun.code === 0 &&
		/\[daisyui-adapter\] warning: light warning fill text is \d+\.\d+:1, below 4\.50:1; the theme's own warning-content sets this pair/.test(
			contentRun.stderr
		),
	`exit ${contentRun.code}, ${(contentRun.stderr.match(/fill text is/g) ?? []).length} fill-text warning(s)`
);

const unreadable = join(WORK, 'unreadable');
scaffold(unreadable);
const oddBlocks = readFileSync(THEME, 'utf8').split(/(?=@plugin 'daisyui\/theme')/);
oddBlocks[0] = oddBlocks[0].replace(/--color-success:\s*[^;]+;/, '--color-success: #22c55e;');
writeFileSync(join(unreadable, 'src', 'daisyui-theme.css'), oddBlocks.join(''));
const oddRun = cliResult(unreadable);
check(
	'a theme value the math cannot read warns once after the write and still exits 0',
	oddRun.code === 0 &&
		oddRun.stdout.includes('wrote ') &&
		/\[daisyui-adapter\] warning: contrast: --color-success for "success" is not an oklch\(\) colour: "#22c55e"; matrix not measured/.test(
			oddRun.stderr
		) &&
		!oddRun.stderr.includes('warning: [daisyui-adapter]'),
	`exit ${oddRun.code}`
);

const bare = join(WORK, 'bare');
scaffold(bare);
rmSync(join(bare, 'src', 'daisyui-theme.css'));
const bareRun = cliResult(bare);
check(
	'no theme reports the matrix as not measured and still exits 0',
	bareRun.code === 0 &&
		bareRun.stdout.includes('contrast: no theme, matrix not measured') &&
		!bareRun.stdout.includes('contrast light'),
	`exit ${bareRun.code}`
);

check('the harness matrix module is deleted', !existsSync(join(HARNESS, 'matrix.mjs')));
const harnessContrast = readFileSync(join(HARNESS, 'contrast.mjs'), 'utf8');
const harnessRun = readFileSync(join(HARNESS, 'run.mjs'), 'utf8');
check(
	'both harness consumers import the package contrast module',
	harnessContrast.includes('packages/daisyui-adapter/dist/contrast.mjs') &&
		harnessRun.includes('packages/daisyui-adapter/dist/contrast.mjs')
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? 'all contrast checks passed' : `${failed.length} contrast check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;

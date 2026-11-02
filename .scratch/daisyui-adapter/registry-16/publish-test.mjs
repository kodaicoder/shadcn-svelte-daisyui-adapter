// Ticket 17: the package the way a stranger gets it. The app has no copy of the adapter, so the CLI
// runs its real self-install branch against the packed tarball named by
// DAISYUI_ADAPTER_INSTALL_SPEC. Then six component adds must leave the stylesheet byte-identical.
//
// Arm `full` keeps the theme, so the plugin emits and the CLI solves the ramp. Arm `missing` deletes
// the theme at the end, so the harness build runs without it.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { hashOf } from './hash.mjs';

const ARM = process.argv[2] ?? 'full';
const REPO = resolve(import.meta.dirname, '..', '..', '..');
const PKG_DIR = join(REPO, 'packages', 'daisyui-adapter');
const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;
const BIN = Object.keys(manifest.bin)[0];
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const THEME = 'src/daisyui-theme.css';
const COMPONENTS = ['button', 'card', 'input', 'dialog', 'tabs', 'chart'];

const step = (name) => console.log(`\n[run-17:${ARM}] ${name}`);
const sh = (cmd, args, env = process.env) =>
	execFileSync(cmd, args, {
		stdio: 'inherit',
		shell: cmd === PNPM && process.platform === 'win32',
		env
	});

const fail = (message) => {
	throw new Error(`[run-17:${ARM}] ${message}`);
};

const headerLines = (css) => [
	...css.matchAll(/^\/\* \S+ \d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)? \| re-run [^\n]*\*\/$/gm)
];

const components = JSON.parse(readFileSync('components.json', 'utf8'));
const stylesheet = components.tailwind?.css;
if (!stylesheet) fail('components.json has no tailwind.css path');

step('packed tarball, found in the app root');
const tarballs = readdirSync('.').filter((file) => file.endsWith('.tgz'));
if (tarballs.length !== 1) fail(`${tarballs.length} *.tgz in ${process.cwd()}, expected one`);
const spec = `./${tarballs[0]}`;
console.log(`[run-17:${ARM}] install spec ${spec}`);

step('cli init, with no copy of the package installed');
sh(process.execPath, [join(PKG_DIR, 'cli', 'init.mjs')], {
	...process.env,
	DAISYUI_ADAPTER_INSTALL_SPEC: spec
});

step('the package landed at the CLI version');
const installedPath = join('node_modules', ...NAME.split('/'), 'package.json');
if (!existsSync(installedPath)) fail(`${installedPath} is missing after the self-install`);
const installed = JSON.parse(readFileSync(installedPath, 'utf8'));
if (installed.version !== VERSION) fail(`installed ${installed.version}, expected ${VERSION}`);
const appPackage = JSON.parse(readFileSync('package.json', 'utf8'));
if (!appPackage.devDependencies?.[NAME]) fail(`${NAME} is not in the app's devDependencies`);
console.log(`[run-17:${ARM}] installed ${NAME} ${installed.version}`);

const shape = (css, when) => {
	const headers = headerLines(css);
	if (headers.length !== 1) fail(`${when}: ${headers.length} header lines`);
	if (!css.startsWith(`/* ${NAME} ${VERSION} `))
		fail(`${when}: header does not name ${NAME} ${VERSION}`);
	if (!css.includes(`@plugin "${NAME}";`)) fail(`${when}: no bare @plugin line`);
	if (!css.includes('@import "./daisyui-adapter.overrides.css";'))
		fail(`${when}: no override import`);
};
shape(readFileSync(stylesheet, 'utf8'), 'after the first init');
const afterInit = hashOf(readFileSync(stylesheet));

step('six component adds');
for (const name of COMPONENTS) {
	sh(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', name, '-y', '-o']);
}

step('cli init again, through the installed bin');
const afterAdds = hashOf(readFileSync(stylesheet));
if (afterInit !== afterAdds)
	fail(`six component adds changed the stylesheet: ${afterInit} then ${afterAdds}`);
sh(PNPM, ['exec', BIN, 'init']);
const after = hashOf(readFileSync(stylesheet));
const rerunCss = readFileSync(stylesheet, 'utf8');
shape(rerunCss, 'after the second init');
if (afterAdds !== after)
	fail(`init after six adds changed the stylesheet: ${afterAdds} then ${after}`);
console.log(`[run-17:${ARM}] stylesheet sha256 ${after} unchanged across six adds and a re-run`);

if (ARM === 'missing') {
	step('delete the theme, so the plugin emits nothing');
	rmSync(THEME);
	console.log(`[run-17:${ARM}] ${THEME} deleted`);
}

console.log(`[run-17:${ARM}] publish test complete`);

// Runs the install chain the ticket names, in one `--then` step: add the packed tarball, run the
// CLI, add the six components, then run the CLI a second time to prove idempotency.
//
// Arm `full` keeps the theme, so the plugin emits and the CLI solves the ramp. Arm `missing`
// deletes the theme after the CLI runs, so the plugin emits nothing and the CLI fallbacks decide
// what renders. That is the ticket's constraint 3.
//
// Every `add` passes -o. Without it shadcn-svelte prompts to overwrite existing files and, with
// piped stdio, waits forever: that is what the harness's 600 s timeout was killing.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { hashOf } from './hash.mjs';

const ARM = process.argv[2] ?? 'full';
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const shell = process.platform === 'win32';
const STYLESHEET = 'src/routes/layout.css';
const step = (name) => console.log(`\n[run-16:${ARM}] ${name}`);

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit', shell });

step('packed adapter tarball (the unpublished stand-in for pnpm dlx <pkg> init)');
const tarball = readdirSync('.').find((f) => f.startsWith('daisyui-adapter-') && f.endsWith('.tgz'));
if (!tarball) throw new Error(`no daisyui-adapter-*.tgz in ${process.cwd()}`);
sh(PNPM, ['add', '-D', `./${tarball}`]);

step('cli init');
sh(PNPM, ['exec', 'daisyui-adapter', 'init']);
const first = hashOf(readFileSync(STYLESHEET));
console.log(`[run-16] stylesheet sha256 after first init: ${first}`);

step('first-run stylesheet, before any component add');
writeFileSync('.stylesheet-after-init-1.css', readFileSync(STYLESHEET));
writeFileSync('.override-after-init-1.css', readFileSync('src/routes/daisyui-adapter.overrides.css'));

for (const name of ['button', 'card', 'input', 'dialog', 'tabs', 'chart']) {
	step(`add ${name}`);
	sh(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', name, '-y', '-o']);
}

step('cli init again (idempotency, and it must survive six component adds)');
sh(PNPM, ['exec', 'daisyui-adapter', 'init']);
const second = hashOf(readFileSync(STYLESHEET));
writeFileSync('.stylesheet-after-init-2.css', readFileSync(STYLESHEET));
console.log(`[run-16] stylesheet sha256 after second init: ${second}`);
if (ARM === 'full' && first !== second) {
	throw new Error(`init is not byte-identical: ${first} then ${second}`);
}

if (ARM === 'missing') {
	step('delete the theme, so the plugin emits nothing');
	rmSync('src/daisyui-theme.css');
}

writeFileSync('.arm.txt', ARM);
console.log(`[run-16:${ARM}] install chain complete`);

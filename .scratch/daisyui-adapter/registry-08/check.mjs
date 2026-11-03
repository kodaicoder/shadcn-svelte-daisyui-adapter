import { readFileSync, statSync } from 'node:fs';

const [cssFile, sentinelFile, themeFile] = process.argv.slice(2);
const css = readFileSync(cssFile, 'utf8');
const sentinels = readFileSync(sentinelFile, 'utf8');

const plugins = [...css.matchAll(/^@plugin\s+"([^"]+)";/gm)].map((m) => m[1]);
const imports = [...css.matchAll(/@import\s+["'][^"']+["'];/g)];
const lastImportEnd = imports.length ? imports.at(-1).index + imports.at(-1)[0].length : -1;
const pluginIndex = css.search(/^@plugin\s+"/m);
const shadcnImports = [...css.matchAll(/@import\s+["']shadcn-svelte\/tailwind\.css["'];/g)].length;

const expectedBytes = String(statSync(themeFile).size);
const pluginLoaded = sentinels.includes('--probe-08-loaded:1');
const readTheme = sentinels.includes(`--probe-08-theme-bytes:${expectedBytes}`);

const ok =
	plugins.length === 1 &&
	plugins[0] === 'daisyui-adapter-08-probe' &&
	pluginIndex > lastImportEnd &&
	shadcnImports === 1 &&
	pluginLoaded &&
	readTheme;

console.log(
	JSON.stringify(
		{
			cssFile,
			plugins,
			imports: imports.length,
			pluginAfterLastImport: pluginIndex > lastImportEnd,
			shadcnImports,
			pluginLoaded,
			readTheme,
			expectedBytes,
			ok
		},
		null,
		2
	)
);
process.exitCode = ok ? 0 : 1;

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import plugin from 'tailwindcss/plugin';

const themeFile = resolve(process.cwd(), 'src/daisyui-theme.css');

console.log(
	`[probe] cwd=${process.cwd()} module=${import.meta.url} theme=${themeFile} exists=${existsSync(themeFile)}`
);

export default plugin(function probe({ addBase }) {
	if (!existsSync(themeFile)) {
		throw new Error(
			`[daisyui-adapter] Cannot read the daisyUI theme file at ${themeFile}: ENOENT. Put one light and one dark theme block from https://daisyui.com/theme-generator/ in that file, then re-run the build.`
		);
	}

	const text = readFileSync(themeFile, 'utf8');
	addBase({
		':root': {
			'--probe-theme-bytes': String(text.length),
			'--probe-cwd': process.cwd()
		}
	});
});

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default {
	handler({ addBase }) {
		const themeFile = resolve(process.cwd(), 'src/daisyui-theme.css');
		if (!existsSync(themeFile)) {
			throw new Error(`[probe-08] cannot read the theme file at ${themeFile}`);
		}
		const bytes = readFileSync(themeFile).length;
		console.log(
			`[probe-08] cwd=${process.cwd()} module=${import.meta.url} theme=${themeFile} bytes=${bytes}`
		);
		addBase({
			':root': { '--probe-08-loaded': '1', '--probe-08-theme-bytes': String(bytes) }
		});
	}
};

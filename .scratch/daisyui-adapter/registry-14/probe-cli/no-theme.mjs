// Removes the theme file so the next build exercises the fallbacks the CLI wrote.
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const theme = resolve('src/daisyui-theme.css');
rmSync(theme);
console.log(`[cli-14] removed ${theme}`);

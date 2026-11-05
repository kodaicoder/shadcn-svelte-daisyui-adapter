// The matrix the CLI would print for the theme as it stands now.
import { readFileSync } from 'node:fs';

import {
	contrastKnownLimits,
	contrastMatrix,
	contrastWarnings
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';
import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';

const path = 'src/daisyui-theme.css';
const matrix = contrastMatrix(parseTheme(readFileSync(path, 'utf8'), path));

console.log(JSON.stringify({ matrix, warnings: contrastWarnings(matrix), limits: contrastKnownLimits(matrix) }, null, 2));

// Standalone config for the code-highlighting check, so it runs without touching vite.config.ts
// or adding a spec to src/. Root stays the repo root: the spec imports #lib/* package imports.
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	root: fileURLToPath(new URL('../../..', import.meta.url)),
	plugins: [svelte({ compilerOptions: { runes: true } })],
	test: {
		name: 'code-highlighting',
		include: ['.opencode/skills/code-highlighting/check/**/*.spec.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: 'chromium', headless: true }]
		}
	}
});

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/sveltekit';
import '../src/routes/layout.css';
import './preview.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		a11y: {
			test: 'error',
			config: {
				rules: [{ id: 'color-contrast', enabled: false }]
			}
		}
	},
	decorators: [
		withThemeByClassName({
			themes: { light: '', dark: 'dark' },
			defaultTheme: 'light'
		})
	]
};

export default preview;

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/sveltekit';
import { addons } from 'storybook/preview-api';
import '../src/routes/layout.css';
import './preview.css';

// A docs entry runs no story decorator, so `withThemeByClassName` never reaches it. This listener
// writes the same class for every view mode.
const themeChannel = addons.getChannel();
const applyThemeClass = ({ globals }: { globals?: { theme?: string } }) => {
	document.documentElement.classList.toggle('dark', globals?.theme === 'dark');
};
themeChannel.on('globalsUpdated', applyThemeClass);
themeChannel.on('setGlobals', applyThemeClass);

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

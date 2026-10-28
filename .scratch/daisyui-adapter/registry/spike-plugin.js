import plugin from 'tailwindcss/plugin';

console.log('[spike-plugin] loaded');

export default plugin(function spike({ addBase }) {
	addBase({
		':root': {
			'--spike-loaded': '1'
		}
	});
});

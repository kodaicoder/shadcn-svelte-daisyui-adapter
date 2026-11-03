declare const plugin: {
	handler: (api: { addBase: (css: Record<string, Record<string, string>>) => void }) => void;
};
export default plugin;

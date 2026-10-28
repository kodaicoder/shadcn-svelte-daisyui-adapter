// Runes live here because a plain .ts file is not compiled by the Svelte plugin.
// The spec imports these and never touches a rune itself.
import { useHighlightedCode } from '#lib/hooks/use-highlighted-code.svelte.js';

export type Doc = {
	code: () => string;
	lang: () => string;
	setCode: (value: string) => void;
	setLang: (value: string) => void;
};

export function createDoc(initial = '', lang = 'typescript'): Doc {
	let code = $state(initial);
	let language = $state(lang);

	return {
		code: () => code,
		lang: () => language,
		setCode: (value: string) => {
			code = value;
		},
		setLang: (value: string) => {
			language = value;
		}
	};
}

export type View = {
	readonly current: ReturnType<typeof useHighlightedCode>['current'];
	destroy: () => void;
};

// The hook calls $effect, which only runs inside an effect root.
export function mount(doc: Doc): View {
	let hook: ReturnType<typeof useHighlightedCode> | undefined;

	const destroy = $effect.root(() => {
		hook = useHighlightedCode(doc.code, doc.lang);
	});

	return {
		get current() {
			if (!hook) throw new Error('hook was not created');
			return hook.current;
		},
		destroy
	};
}

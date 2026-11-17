import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'svelte/compiler';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const FIXTURES = join(ROOT, 'scripts', 'fixtures', 'stories');
const USAGE = 'usage: node scripts/check-stories.mjs [--root <dir>]';

const TS_WRAPPERS = new Set([
	'TSAsExpression',
	'TSSatisfiesExpression',
	'TSNonNullExpression',
	'TSParenthesizedExpression'
]);
const NOT_CONTENT = new Set([
	'Text',
	'Comment',
	'ExpressionTag',
	'HtmlTag',
	'RenderTag',
	'ConstTag',
	'DebugTag'
]);
const CSF = /\.stories\.(?:js|ts|mjs|cjs)$/;
const MARKER = /<!--\s*expect\s+([a-z][a-z-]*)\s+at\s+(\d+)\s*-->/g;

const unwrap = (node) => {
	let current = node;
	while (current && TS_WRAPPERS.has(current.type)) current = current.expression;
	return current;
};

const lineAt = (source, offset) => source.slice(0, offset).split('\n').length;

const findAttribute = (node, name) =>
	node.attributes.find((attribute) => attribute.type === 'Attribute' && attribute.name === name) ??
	null;

const decodeText = (attribute) => {
	if (!attribute || !Array.isArray(attribute.value)) return null;
	if (attribute.value.some((chunk) => chunk.type !== 'Text')) return null;
	return attribute.value.map((chunk) => chunk.data).join('');
};

const expressionOf = (attribute) => {
	if (!attribute || !attribute.value || Array.isArray(attribute.value)) return null;
	if (attribute.value.type !== 'ExpressionTag') return null;
	return unwrap(attribute.value.expression);
};

const spreadsParameter = (node, name) => {
	if (!node || typeof node !== 'object') return false;
	if (Array.isArray(node)) return node.some((child) => spreadsParameter(child, name));
	if (node.type === 'SpreadAttribute') {
		const expression = unwrap(node.expression);
		return expression?.type === 'Identifier' && expression.name === name;
	}
	return Object.entries(node).some(
		([key, value]) => key !== 'parent' && spreadsParameter(value, name)
	);
};

const toArgs = (node, source, storyLine) => {
	const attribute = findAttribute(node, 'args');
	if (!attribute) return { present: false, literal: false, properties: 0, line: storyLine };
	const expression = expressionOf(attribute);
	const literal = expression?.type === 'ObjectExpression';
	return {
		present: true,
		literal,
		properties: literal ? expression.properties.length : 0,
		line: lineAt(source, attribute.start)
	};
};

const toTemplate = (node, source) => {
	const snippet = node.fragment.nodes.find(
		(block) => block.type === 'SnippetBlock' && block.expression?.name === 'template'
	);
	if (!snippet) return { present: false, parameter: null, spreads: false, line: 0 };
	const parameter = snippet.parameters?.[0]?.name ?? null;
	return {
		present: true,
		parameter,
		spreads: parameter !== null && spreadsParameter(snippet.body, parameter),
		line: lineAt(source, snippet.start)
	};
};

const toStory = (node, source) => {
	const name = decodeText(findAttribute(node, 'name'))?.trim() ?? null;
	const line = node.name_loc.start.line;
	const content = node.fragment.nodes.filter(
		(child) =>
			!NOT_CONTENT.has(child.type) &&
			!(child.type === 'SnippetBlock' && child.expression?.name === 'template')
	).length;
	return {
		name,
		line,
		asChild: findAttribute(node, 'asChild') !== null,
		args: toArgs(node, source, line),
		template: toTemplate(node, source),
		content
	};
};

const readStoryFile = (source, path) => {
	const ast = parse(source, { modern: true });
	const stories = ast.fragment.nodes
		.filter((node) => node.type === 'Component' && node.name === 'Story')
		.map((node) => toStory(node, source));
	return { path, source, ast, stories };
};

const rawSelectControls = (file) => {
	const found = [];
	const visit = (node) => {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}
		if (node.type === 'Property') {
			const key = node.key?.name ?? node.key?.value;
			const value = unwrap(node.value);
			if (key === 'control' && value?.type === 'Literal' && value.value === 'select') {
				found.push({ line: lineAt(file.source, node.start) });
			}
		}
		for (const [key, value] of Object.entries(node)) {
			if (key !== 'parent') visit(value);
		}
	};
	for (const script of [file.ast.module, file.ast.instance]) if (script) visit(script.content);
	return found;
};

const finding = (file, line, rule, message) => ({ path: file.path, line, rule, message });

const aschildRequired = (file) =>
	file.stories
		.filter((story) => story.content > 0 && !story.template.present && !story.asChild)
		.map((story) =>
			finding(
				file,
				story.line,
				'aschild-required',
				`Story "${story.name ?? '(unnamed)'}" renders its own markup without asChild, so the addon forwards its markup into the component wrapper; add asChild`
			)
		);

const playgroundShape = (file) => {
	const playgrounds = file.stories.filter((story) => story.name === 'Playground');
	if (playgrounds.length === 0) {
		return [
			finding(
				file,
				1,
				'playground-shape',
				'no Story named "Playground"; the docs page needs exactly one to drive Controls'
			)
		];
	}
	if (playgrounds.length > 1) {
		return [
			finding(
				file,
				playgrounds[1].line,
				'playground-shape',
				'a second Story named "Playground"; a file declares exactly one'
			)
		];
	}
	const [playground] = playgrounds;
	const findings = [];
	const { args } = playground;
	if (!(args.present && args.literal && args.properties > 0)) {
		findings.push(
			finding(
				file,
				playground.line,
				'playground-shape',
				'Story "Playground" needs a non-empty args object literal, or Controls cannot drive the component'
			)
		);
	}
	if (!(playground.template.present && playground.template.spreads)) {
		findings.push(
			finding(
				file,
				playground.line,
				'playground-shape',
				'Story "Playground" needs a #snippet template that spreads its parameter, or Controls cannot bind args'
			)
		);
	}
	return findings;
};

const selectHelper = (file) =>
	rawSelectControls(file).map(({ line }) =>
		finding(
			file,
			line,
			'select-helper',
			"raw control: 'select'; call selectControl([...]) from src/stories/story-args.ts so the enum type survives URL-persisted args"
		)
	);

const RULES = [
	{ id: 'aschild-required', check: aschildRequired },
	{ id: 'playground-shape', check: playgroundShape },
	{ id: 'select-helper', check: selectHelper }
];

const parseFinding = (error, path) => ({
	path,
	line: error.start?.line ?? 1,
	rule: 'story-file',
	message: `does not parse: ${String(error.message).split('\n')[0]}`
});

const lintFile = (source, path) => {
	try {
		const file = readStoryFile(source, path);
		return {
			findings: RULES.flatMap((rule) => rule.check(file)),
			stories: file.stories.length
		};
	} catch (error) {
		if (!error.start) throw error;
		return { findings: [parseFinding(error, path)], stories: 0 };
	}
};

const lintSource = (source, path) => lintFile(source, path).findings;

const discover = (root) => {
	const paths = [];
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) walk(path);
			else if (entry.name.endsWith('.stories.svelte') || CSF.test(entry.name)) paths.push(path);
		}
	};
	walk(join(root, 'src'));
	return paths.map((path) => relative(root, path).split(sep).join('/')).sort();
};

const runFixtures = (dir) => {
	const names = readdirSync(dir)
		.filter((name) => name.endsWith('.stories.svelte.fixture'))
		.sort();
	const mismatches = [];
	const covered = new Set();
	for (const name of names) {
		const source = readFileSync(join(dir, name), 'utf8');
		const expected = [...source.matchAll(MARKER)].map((match) => `${match[1]}@${match[2]}`).sort();
		const actual = lintSource(source, name)
			.map((entry) => `${entry.rule}@${entry.line}`)
			.sort();
		const marked = expected.join(' ') === actual.join(' ');
		if (!marked) {
			mismatches.push(
				`fixture ${name}: expected ${expected.join(', ') || 'nothing'}, got ${actual.join(', ') || 'nothing'}`
			);
		}
		const failRule = /^fail--([a-z][a-z-]*)--/.exec(name)?.[1] ?? null;
		if (failRule) {
			covered.add(failRule);
			if (!actual.some((entry) => entry.startsWith(`${failRule}@`))) {
				mismatches.push(`fixture ${name}: fail fixture produced no ${failRule} finding`);
			}
		}
		if (name.startsWith('pass--') && marked && actual.length > 0) {
			mismatches.push(`fixture ${name}: pass fixture produced ${actual.length} finding(s)`);
		}
	}
	for (const rule of RULES) {
		if (!covered.has(rule.id)) mismatches.push(`no fail fixture for rule ${rule.id}`);
	}
	if (names.length === 0) mismatches.push(`no fixtures in ${dir}`);
	return { mismatches, count: names.length };
};

const byPosition = (left, right) =>
	left.path.localeCompare(right.path) ||
	left.line - right.line ||
	left.rule.localeCompare(right.rule);

const main = () => {
	const argv = process.argv.slice(2);
	let root = ROOT;
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] !== '--root') {
			console.error(`unknown argument: ${argv[index]}\n${USAGE}`);
			return 2;
		}
		const value = argv[index + 1];
		if (!value) {
			console.error(`--root needs a directory\n${USAGE}`);
			return 2;
		}
		root = resolve(value);
		index += 1;
	}

	let paths;
	try {
		paths = discover(root);
	} catch (error) {
		console.error(`cannot read ${join(root, 'src')}: ${error.message}`);
		return 2;
	}

	const findings = [];
	let stories = 0;
	for (const path of paths) {
		if (!path.endsWith('.stories.svelte')) {
			findings.push({
				path,
				line: 1,
				rule: 'story-file',
				message:
					'CSF story file; this linter reads only .stories.svelte, so Storybook would load it unchecked'
			});
			continue;
		}
		let source;
		try {
			source = readFileSync(join(root, path), 'utf8');
		} catch (error) {
			console.error(`cannot read ${join(root, path)}: ${error.message}`);
			return 2;
		}
		const linted = lintFile(source, path);
		findings.push(...linted.findings);
		stories += linted.stories;
	}
	findings.sort(byPosition);

	let fixtures;
	try {
		fixtures = runFixtures(FIXTURES);
	} catch (error) {
		console.error(`cannot read fixtures at ${FIXTURES}: ${error.message}`);
		return 2;
	}

	if (findings.length > 0) {
		for (const entry of findings) {
			console.log(`${entry.path}:${entry.line}  ${entry.rule}  ${entry.message}`);
		}
		console.log('');
	}
	for (const mismatch of fixtures.mismatches) console.log(mismatch);
	if (fixtures.mismatches.length > 0) console.log('');

	const files = paths.length;
	console.log(
		`${files} story file${files === 1 ? '' : 's'}, ${stories} stor${stories === 1 ? 'y' : 'ies'}, ${RULES.length} rules, ${fixtures.count} fixtures`
	);
	if (findings.length === 0 && fixtures.mismatches.length === 0) {
		console.log('no findings, fixtures match');
		return 0;
	}
	const brokenFiles = new Set(findings.map((entry) => entry.path)).size;
	const parts = [];
	if (findings.length > 0) {
		const plural = findings.length === 1 ? '' : 's';
		const filePlural = brokenFiles === 1 ? '' : 's';
		parts.push(`${findings.length} finding${plural} in ${brokenFiles} file${filePlural}`);
	}
	if (fixtures.mismatches.length > 0) {
		const plural = fixtures.mismatches.length === 1 ? '' : 'es';
		parts.push(`${fixtures.mismatches.length} fixture mismatch${plural}`);
	}
	console.log(parts.join(', '));
	return 1;
};

process.exitCode = main();

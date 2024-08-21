import { toString as mdastToString } from 'mdast-util-to-string';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { type Processor, unified } from 'unified';

function remarkToText(this: Processor) {
	this.compiler = (tree) => mdastToString(tree);
}

export const markdownToHtml = (string: string) =>
	unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeSanitize)
		.use(rehypeStringify)
		.processSync(string)
		.toString();

export const markdownToText = (string: string) =>
	unified().use(remarkParse).use(remarkToText).processSync(string).toString();

export const htmlToMarkdown = (string: string) =>
	unified().use(rehypeParse).use(rehypeRemark).use(remarkStringify).processSync(string).toString();

// TODO: Replace this basic polyfill by `Object.groupBy` when it is in Node LTS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy<T, U extends keyof any>(arr: T[], fn: (x: T) => U): Record<U, T[]> {
	const obj = {} as Record<U, T[]>;
	for (const x of arr) {
		const key = fn(x);
		obj[key] ??= []; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		obj[key].push(x);
	}
	return obj;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function countBy<T, U extends keyof any>(arr: T[], fn: (x: T) => U): Record<U, number> {
	const obj = {} as Record<U, number>;
	for (const x of arr) {
		const key = fn(x);
		obj[key] ??= 0; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		obj[key] += 1;
	}
	return obj;
}

// This function is taken from https://stackoverflow.com/a/37580979
// And licensed under https://creativecommons.org/licenses/by-sa/4.0/
export function* permute<T>(permutation: T[]) {
	const length = permutation.length,
		c = Array(length).fill(0);
	let i = 1,
		k,
		p;

	yield permutation.slice();
	while (i < length) {
		if (c[i] < i) {
			k = i % 2 && c[i];
			p = permutation[i];
			permutation[i] = permutation[k];
			permutation[k] = p;
			++c[i];
			i = 1;
			yield permutation.slice();
		} else {
			c[i] = 0;
			++i;
		}
	}
}

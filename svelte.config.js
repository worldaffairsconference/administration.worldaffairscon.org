import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import {
	optimizeImports,
	optimizeCss,
	elements,
	icons,
	pictograms,
} from 'carbon-preprocess-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), optimizeImports(), elements(), icons(), pictograms()],

	kit: {
		adapter: adapter(),
	},

	vite: {
		plugins: [process.env.NODE_ENV === 'production' && optimizeCss()],
	},
};

export default config;

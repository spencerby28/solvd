import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/layerchart/**/*.{svelte,js}'
	],

	theme: {
		extend: {}
	},

	safelist: [
		'from-indigo-400',
		'to-indigo-600',
		'from-emerald-400', 
		'to-emerald-600',
		'from-sky-400',
		'to-sky-600',
		'from-amber-400',
		'to-amber-600', 
		'from-rose-400',
		'to-rose-600',
		'from-purple-400',
		'to-purple-600'
	],

	plugins: []
} satisfies Config;

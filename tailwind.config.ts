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
		'to-purple-600',
		'bg-green-100',
		'text-green-800',
		'bg-yellow-100',
		'text-yellow-800', 
		'bg-red-100',
		'text-red-800',
		'bg-gray-100',
		'text-gray-800',
		'text-red-600',
		'text-yellow-600',
		'text-green-600',
		'text-gray-600'
	],

	plugins: []
} satisfies Config;

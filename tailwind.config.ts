import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{html,svelte}",
		"./node_modules/svelte-ux/**/*.{svelte,js}",
		"./node_modules/layerchart/**/*.{svelte,js}"
	],
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
		'text-gray-600',
		"dark"
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			animation: {
				rippling: "rippling var(--duration) ease-out",
			},
			keyframes: {
				rippling: {
					"0%": {
						opacity: "1",
					},
					"100%": {
						transform: "scale(2)",
						opacity: "0",
					},
				},
			},
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			}
		}
	},
};

export default config;

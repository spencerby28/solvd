import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: process.env.NODE_ENV === 'development' ? 8001 : 5173
	}
});

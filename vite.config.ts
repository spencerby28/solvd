import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api/ai': {
				target: 'http://localhost:8000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/ai/, '')
			}
		}
	}
});

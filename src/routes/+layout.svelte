<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	
	
	let { children } = $props();
	let notificationPrefs = {};
	
	onMount(async () => {
		const session = await fetch('/api/web/session').then(res => res.json());
		console.log('session', session);
		if (session.session) {
			const cookieFallback = JSON.stringify({
				[`a_session_solvd`]: session.session
			});
			localStorage.setItem('cookieFallback', cookieFallback);
		}
	});
</script>

{@render children()}

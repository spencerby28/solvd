<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { PUBLIC_INSTAGRAM_APP_ID, PUBLIC_INSTAGRAM_REDIRECT_URI, PUBLIC_PRODUCTION_INSTAGRAM_REDIRECT_URI, PUBLIC_PRODUCTION } from '$env/static/public';

	const redirectUri = PUBLIC_PRODUCTION ? PUBLIC_INSTAGRAM_REDIRECT_URI : PUBLIC_PRODUCTION_INSTAGRAM_REDIRECT_URI;
	console.log(redirectUri);
</script>

<div class="h-screen flex items-center justify-center">
	<div class="w-64">
		<Button
			on:click={() => {
				window.location.href =
					`https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
			}}
			variant="primary"
		>
			Connect Instagram
		</Button>
	</div>
</div>

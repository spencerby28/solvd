<script>
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="h-screen flex items-center justify-center">
	<div class="w-64">
		<Button
			on:click={() => {
				window.location.href =
					'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1298835914686628&redirect_uri=https://localhost:5173/api/callback/instagram&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish';
			}}
			variant="primary"
		>
			Connect Instagram
		</Button>
	</div>
</div>

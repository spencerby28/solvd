<script lang='ts'>
	import type {Messages} from '$lib/types'
	export let messages: Messages[] = [];
	export let ticketId = '';
	export let ticketSubject = '';
	export let tenantId = '';
	export let tenantName = '';
</script>



<div id="email-container" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
	<h1 style="color: #16a34a; font-size: 24px; font-weight: bold; margin-bottom: 5px;">{ticketSubject}</h1>
	<p style="color: #9ca3af; font-size: 12px; margin-bottom: 20px;">Ticket #{ticketId}</p>
	{#each messages as message}
		<div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; background-color: {message.sender_type === 'customer' ? '#f3f4f6' : '#e5e7eb'};">
			<div style="font-weight: bold; margin-bottom: 5px;">{message.sender_name}</div>
			<div style="white-space: pre-wrap;">{message.content}</div>
		</div>
	{/each}
	<hr style="border: 0; height: 1px; background-color: #e5e7eb; margin: 30px 0;" />

	<div style="text-align: center;">
		<p style="color: #6b7280; font-size: 14px;">To respond to this conversation, you can:</p>
		<div style="margin: 20px 0;">
			<a 
				id="action-button"
				href="https://getsolvd.xyz/{tenantId}/ticket/{ticketId}"
				style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; mso-hide: all;"
			>
				Open in {tenantName} Support
			</a>
		</div>
		<p style="color: #9ca3af; font-size: 12px;">
			Or simply reply to this email directly
		</p>
	</div>
	<div  id="email-footer" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; border-radius: 8px;">
		<p style="color: #9ca3af; font-size: 16px;">
			Powered by <a id="brand-link" href="https://getsolvd.xyz" style="color: #16a34a; text-decoration: none; font-weight: bold;">GetSolvd</a>
		</p>
	</div>
</div>

<style>
	#action-button:hover {
		background-color: #15803d !important;
	}

</style>

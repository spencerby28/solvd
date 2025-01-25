<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createBrowserClient } from '$lib/appwrite-browser';
	import { initializeRealtime, tickets, messages } from '$lib/utils/realtime';
	import type { TicketDocument, MessageDocument } from '$lib/utils/realtime';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import LeftSidebar from '$lib/components/inbox/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/inbox/RightSidebar.svelte';
	import { fly } from 'svelte/transition';

	export let data: LayoutData;
	let unsubscribe: () => void;
	const isSidebarCollapsed = writable(false);
	$: ticketId = $page.params.ticketId;

	onMount(async () => {
		const session = await fetch('/api/web/session').then(res => res.json());
		console.log('session', session);
		if (session.session) {
			const cookieFallback = JSON.stringify({
				[`a_session_solvd`]: session.session
			});
			localStorage.setItem('cookieFallback', cookieFallback);
		}

		try {
			const { client, databases, account } = createBrowserClient();
			// Initialize realtime with server-side data
			unsubscribe = initializeRealtime(
				client, 
				databases, 
				data.recentTickets as TicketDocument[],
				data.messages as MessageDocument[]
			);
		} catch (error) {
			console.error('Error initializing realtime:', error);
		}
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});
</script>

<div class="flex h-screen">
	<!-- Left Sidebar -->
	<LeftSidebar  bind:isCollapsed={$isSidebarCollapsed} />

	<!-- Main content -->
	<main class="flex-1">
		<slot />
	</main>

	<!-- Right Sidebar -->
	{#if ticketId}
		<div in:fly={{ x: 300, duration: 300 }}>
			<RightSidebar ticket={$tickets.find(ticket => ticket.$id === ticketId)} />
		</div>
	{/if}

</div>
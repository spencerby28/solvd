<script lang="ts">
	import { page } from '$app/stores';
    import { writable } from 'svelte/store';
    import RightSidebar from '$lib/components/inbox/RightSidebar.svelte';
    import LeftSidebar from '$lib/components/inbox/LeftSidebar.svelte';

    const isSidebarCollapsed = writable(false);
</script>

<div class="flex h-screen">
	<!-- Left Sidebar -->
	<LeftSidebar bind:isCollapsed={$isSidebarCollapsed} />

	<!-- Main content -->
	<main class="flex-1 p-8">
		<slot />
	</main>

	<!-- Right Sidebar -->
	<RightSidebar />

</div>

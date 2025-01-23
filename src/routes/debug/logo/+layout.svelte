<script lang="ts">
	import { page } from '$app/stores';
	let isOpen = true;
    import RightSidebar from '$lib/components/inbox/RightSidebar.svelte';

	const menuItems = [
		{
			title: 'Logo Generator',
			items: ['View Logos', 'Generate New', 'Edit Existing'],
			expanded: true
		},
		{
			title: 'Settings',
			items: ['Preferences', 'API Keys', 'Export'],
			expanded: false
		}
	];

	function toggleDropdown(index: number) {
		menuItems[index].expanded = !menuItems[index].expanded;
	}
</script>

<div class="flex h-screen">
	<!-- Left Sidebar -->
	<aside
		class="w-64 transition-all duration-300 bg-white border-r border-gray-200 shadow-lg {isOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="p-4 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-800">Logo Debug</h2>
		</div>

		<nav class="p-4">
			{#each menuItems as item, i}
				<div class="mb-4">
					<button
						on:click={() => toggleDropdown(i)}
						class="flex items-center justify-between w-full p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
					>
						<span>{item.title}</span>
						<svg
							class="w-4 h-4 transition-transform {item.expanded ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{#if item.expanded}
						<div class="ml-4 mt-2 space-y-2">
							{#each item.items as subItem}
								<a
									href="#"
									class="block p-2 text-sm text-gray-600 hover:text-[#16a34a] hover:bg-gray-50 rounded-md transition-colors"
								>
									{subItem}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex-1 p-8">
		<slot />
	</main>

	<!-- Right Sidebar -->
	<RightSidebar />

</div>

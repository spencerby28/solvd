<script lang="ts">
    import { Menu, MenuItem, Toggle } from 'svelte-ux';
    import * as Dropdown from '$lib/components/ui/dropdown-menu';
    import Badge from '$lib/components/ui/Badge.svelte';
    import { onMount } from 'svelte';

    let selectedAssignees = new Set<string>();
    let isDropdownOpen = false;
    let expandedAssignee: string | null = null;
    let expandTimeout: NodeJS.Timeout | null = null;

    // Add status type and current status
    type Status = 'online' | 'away' | 'offline';
    let currentStatus: Status = 'online';

    // Status color mapping
    $: statusColor = {
        online: '#16a34a', // green
        away: '#eab308',   // yellow
        offline: '#dc2626'  // red
    }[currentStatus];

    const assignees = [
        // Sales Team
        { name: 'Sarah Johnson', role: 'Sales', color: '#2563eb' },
        { name: 'Mike Peters', role: 'Sales', color: '#2563eb' },
        { name: 'Emma Wilson', role: 'Sales', color: '#2563eb' },
        // Fulfillment Team  
        { name: 'James Rodriguez', role: 'Fulfillment', color: '#16a34a' },
        { name: 'Lisa Chen', role: 'Fulfillment', color: '#16a34a' },
        { name: 'David Smith', role: 'Fulfillment', color: '#16a34a' },
        // Admin Team
        { name: 'Jennifer Taylor', role: 'Admin', color: '#dc2626' },
        { name: 'Michael Chang', role: 'Admin', color: '#dc2626' },
        { name: 'Rachel Green', role: 'Admin', color: '#dc2626' }
    ];

    function toggleAssignee(assignee: string) {
        if (selectedAssignees.has(assignee)) {
            selectedAssignees.delete(assignee);
        } else {
            selectedAssignees.add(assignee);
        }
        selectedAssignees = selectedAssignees;
    }

    function removeAssignee(assignee: string) {
        selectedAssignees.delete(assignee);
        selectedAssignees = selectedAssignees;
    }

    function handleTagClick(assigneeName: string, event: MouseEvent) {
        event.stopPropagation();
        if (expandedAssignee === assigneeName) {
            expandedAssignee = null;
            if (expandTimeout) clearTimeout(expandTimeout);
        } else {
            expandedAssignee = assigneeName;
            if (expandTimeout) clearTimeout(expandTimeout);
            expandTimeout = setTimeout(() => {
                expandedAssignee = null;
            }, 1500);
        }
    }

    function handleClickAway(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.assignee-tag')) {
            expandedAssignee = null;
            if (expandTimeout) clearTimeout(expandTimeout);
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickAway);
        return () => {
            document.removeEventListener('click', handleClickAway);
            if (expandTimeout) clearTimeout(expandTimeout);
        };
    });

    $: availableAssignees = assignees.filter(a => !selectedAssignees.has(a.name));
</script>

<style>
    @keyframes status-pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(var(--status-shadow-color), 0.7);
        }
        70% {
            box-shadow: 0 0 0 6px rgba(var(--status-shadow-color), 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(var(--status-shadow-color), 0);
        }
    }

    .status-indicator {
        animation: status-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
        transition: background-color 0.2s ease;
    }

    .status-indicator[data-status="online"] {
        --status-shadow-color: 22, 163, 74;
    }

    .status-indicator[data-status="away"] {
        --status-shadow-color: 234, 179, 8;
    }

    .status-indicator[data-status="offline"] {
        --status-shadow-color: 220, 38, 38;
    }
</style>

<aside class="w-80 bg-gray-100 border-x border-gray-200 shadow-lg relative rounded-tr-3xl">
	
    <div class="p-4">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-[#16a34a] bg-opacity-60 flex items-center justify-center relative">
                <span class="text-xl font-bold text-white">D</span>
                <div 
                    class="status-indicator absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white transform translate-x-1 -translate-y-1"
                    style="background-color: {statusColor}"
                    data-status={currentStatus}
                ></div>
            </div>
            <div class="space-y-0.5">
                <p class="text-2xl font-bold">John Doe</p>
                <p class="text-sm text-gray-600 underline">john@example.com</p>
            </div>
        </div>
        <button class="w-full mt-8 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
            View Profile
        </button>
    </div>
    <div class="p-4 border-t border-gray-200">
        {#if selectedAssignees.size > 0}
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs text-gray-500">ASSIGNED TO</p>
                <Dropdown.Root bind:open={isDropdownOpen}>
                    <Dropdown.Trigger class="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 hover:bg-green-100 text-black transition-colors border border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </Dropdown.Trigger>
                    <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ml-auto">
                        {#if availableAssignees.length === 0}
                            <div class="px-3 py-2 text-sm text-gray-500">No more assignees available</div>
                        {:else}
                            {#each availableAssignees as assignee}
                                <Dropdown.Item 
                                    class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between"
                                    on:click={() => toggleAssignee(assignee.name)}
                                >
                                    <span>{assignee.name}</span>
                                    <Badge outline={true} text={assignee.role} color={assignee.color} />
                                </Dropdown.Item>
                            {/each}
                        {/if}
                    </Dropdown.Content>
                </Dropdown.Root>
            </div>
        {/if}

        {#if selectedAssignees.size === 0}
            <Dropdown.Root bind:open={isDropdownOpen}>
                <Dropdown.Trigger class="w-full py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Assign to
                </Dropdown.Trigger>
                <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {#each assignees as assignee}
                        <Dropdown.Item 
                            class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between"
                            on:click={() => toggleAssignee(assignee.name)}
                        >
                            <span>{assignee.name}</span>
                            <Badge outline={true} text={assignee.role} color={assignee.color} />
                        </Dropdown.Item>
                    {/each}
                </Dropdown.Content>
            </Dropdown.Root>
        {:else}
            <div class="flex flex-wrap gap-2">
                {#each Array.from(selectedAssignees) as assigneeName}
                    {@const assignee = assignees.find(a => a.name === assigneeName)}
                    <!--@svelte-ignore a11y-no-static-element-interactions-->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div 
                        aria-label="Assignee tag"
                        aria-roledescription="Assignee tag"
                        class="assignee-tag group flex items-center text-center transition-all duration-300 {expandedAssignee === assigneeName ? 'pr-7' : ''} relative bg-white text-gray-900 font-medium px-3 py-1.5 rounded-md text-sm border cursor-pointer" 
                        style="border-color: {assignee?.color || '#16a34a'}"
                        on:click={(e) => handleTagClick(assigneeName, e)}
                    >
                        <span class="mx-auto">{assigneeName}</span>

                        <button 
                            aria-label="Remove assignee"
                            class="absolute right-2 transition-all duration-300 {expandedAssignee === assigneeName ? 'opacity-100' : 'opacity-0'}"
                            on:click={(e) => {
                                e.stopPropagation();
                                removeAssignee(assigneeName);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-500 hover:text-gray-700">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
            
        {/if}
    </div>

    <!-- Private Messages Section 
    <div class="p-4">
        <h3 class="text-lg font-medium text-gray-700 mb-3">Private Messages</h3>
        <div class="space-y-4">
            <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Last contact: 2 days ago</p>
                <p class="text-sm text-gray-800 mt-1">Customer requested urgent logo revision...</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Last week</p>
                <p class="text-sm text-gray-800 mt-1">Initial logo requirements discussed...</p>
            </div>
        </div>
    </div>
    -->
</aside>
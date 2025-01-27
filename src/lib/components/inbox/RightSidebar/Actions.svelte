<script lang="ts">
    import { slide } from 'svelte/transition';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import * as Dropdown from '$lib/components/ui/dropdown-menu';
    import Badge from '$lib/components/primatives/Badge.svelte';
    import type { Tickets } from '$lib/types';
    import { PencilLine } from 'lucide-svelte';
    import { page } from '$app/stores';
    import { collapsed } from '$lib/stores/collapsed';
    import { updateTicketStatus } from '$lib/db/ticket';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';

    $: console.log('selectedTicket', $selectedTicket?.status);
    export let ticket: Tickets | undefined;

    let selectedAssignees = new Set<string>();
    let isAssignDropdownOpen = false;
    let isConnectAccountsDropdownOpen = false;
    let expandedAssignee: string | null = null;
    let userName = $page.data.user.name;
    let expandTimeout: NodeJS.Timeout | null = null;

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
    async function escalateTicket() {
        if (!$selectedTicket) return;
        await updateTicketStatus($selectedTicket.$id, 'ESCALATED', userName);
    }

    // Helper function to calculate ticket duration
    function getTicketDuration(): number {
        if (!ticket) return 0;
        return Math.floor((Date.now() - new Date(ticket.$createdAt).getTime()) / 60000);
    }

    function formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 600) { // Less than 10 hours
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        } else if (minutes < 1440) { // Less than 24 hours
            const hours = Math.floor(minutes / 60);
            return `${hours}hr`;
        } else { // Days
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return hours > 0 ? `${days}d ${hours}hr` : `${days}d`;
        }
    }

    $: availableAssignees = assignees.filter(a => !selectedAssignees.has(a.name));
</script>

<style>
    /* Add a minimal height constraint to prevent initial jolt */
    :global(.slide-transition) {
        min-height: 0;
        height: auto !important;
    }
</style>

<div class="p-4 border-t border-gray-200">
    <div class="slide-transition" transition:slide|local>
        {#if !$collapsed}
            {#if selectedAssignees.size > 0}
                <div class="flex items-center justify-between mb-4">
                    <p class="text-xs text-gray-500">ASSIGNED TO</p>
                    <Dropdown.Root bind:open={isAssignDropdownOpen}>
                        <Dropdown.Trigger class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-50 text-gray-500 transition-colors">
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
                <div class="flex flex-wrap gap-2">
                    {#each Array.from(selectedAssignees) as assigneeName}
                        {@const assignee = assignees.find(a => a.name === assigneeName)}
                        <!-- svelte-ignore a11y_label_has_required_name -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div 
                            class="assignee-tag group flex items-center text-center transition-all duration-300 {expandedAssignee === assigneeName ? 'pr-7' : ''} relative bg-white text-gray-900 font-medium px-3 py-1.5 rounded-md text-sm border cursor-pointer" 
                            style="border-color: {assignee?.color || '#16a34a'}"
                            on:click={(e) => handleTagClick(assigneeName, e)}
                        >
                            <span class="mx-auto">{assigneeName}</span>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button 
                                class="absolute right-2 transition-all duration-300 {expandedAssignee === assigneeName ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
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
            {:else}
                <Dropdown.Root bind:open={isAssignDropdownOpen}>
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
            {/if}
        {:else}
            <Dropdown.Root bind:open={isAssignDropdownOpen}>
                <Dropdown.Trigger class="w-full flex justify-center py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
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
        {/if}
    </div>
</div>

<!-- Quick Actions Section -->
<div class="p-4 border-t border-gray-200">
    {#if !$collapsed}
        <p class="text-xs text-gray-500 mb-3 slide-transition" transition:slide|local>QUICK ACTIONS</p>
    {/if}
    <div class="grid {$collapsed ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'}">
        <RippleButton 
            class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center {$collapsed ? 'justify-center' : ''}"
            rippleColor="#16a34a"
            duration="500ms"
        >
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
                {#if !$collapsed}
                    <span>Add Note</span>
                {/if}
            </div>
        </RippleButton>
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div on:click={() => $selectedTicket?.status !== 'ESCALATED' && escalateTicket()}>
            <RippleButton 
                class="w-full p-2 text-sm {ticket?.status === 'ESCALATED' ? 'bg-red-50 text-red-600' : 'bg-white'} hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center {$collapsed ? 'justify-center' : ''}"
                rippleColor="#dc2626"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    {#if !$collapsed}
                        <span>{ticket?.status === 'ESCALATED' ? 'Escalated' : 'Escalate'}</span>
                    {/if}
                </div>
            </RippleButton>
        </div>
        <RippleButton 
            class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center {$collapsed ? 'justify-center' : ''}"
            rippleColor="#16a34a"
            duration="500ms"
        >
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                {#if !$collapsed}
                    <span>Send Email</span>
                {/if}
            </div>
        </RippleButton>
        <RippleButton 
            class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center {$collapsed ? 'justify-center' : ''}"
            rippleColor="#6b7280"
            duration="500ms"
        >
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
                {#if !$collapsed}
                    <span>Copy ID</span>
                {/if}
            </div>
        </RippleButton>
    </div>
</div>

<!-- Connected Accounts -->
<div class="p-4 border-t border-gray-200">
    {#if !$collapsed}
        <p class="text-xs text-gray-500 mb-3 slide-transition" transition:slide|local>CONNECTED ACCOUNTS</p>
    {/if}
    {#if !ticket?.customer_instagram_username && !ticket?.customer_shopify_id}
        {#if !$collapsed}
            <Dropdown.Root bind:open={isConnectAccountsDropdownOpen}>
                <Dropdown.Trigger class="w-full py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    External Account
                </Dropdown.Trigger>
                <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                        </div>
                        Connect Instagram
                    </Dropdown.Item>
                    <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-[#16a34a] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                        </div>
                        Connect Shopify
                    </Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Root>

        {/if}
    {:else}
        <div class="space-y-3">
            {#if ticket.customer_instagram_username}
                <div class="flex items-center justify-between w-full">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                    </div>
                    {#if !$collapsed}
                        <div class="flex-1 px-2">
                            <p class="text-sm font-medium text-gray-900">Instagram</p>
                            <p class="text-xs text-gray-500">{ticket.customer_instagram_username}</p>
                        </div>
                        <a href="https://instagram.com/{ticket.customer_instagram_username}" target="_blank" rel="noopener noreferrer" class="text-sm text-green-600 hover:text-green-700">View</a>
                    {/if}
                </div>
            {/if}

            {#if ticket.customer_shopify_id}
                <div class="flex items-center justify-between w-full">
                    <div class="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                    </div>
                    {#if !$collapsed}
                        <div class="flex-1 px-2">
                            <p class="text-sm font-medium text-gray-900">Shopify</p>
                            <p class="text-xs text-gray-500">Connected</p>
                        </div>
                        <button class="text-sm text-green-600 hover:text-green-700">View</button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Ticket Summary 
{#if !$collapsed}
    <div class="p-4 border-t border-gray-200 slide-transition" transition:slide|local>
        <p class="text-xs text-gray-500 mb-3">TICKET SUMMARY</p>
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex flex-col items-center">
                    <p class="text-lg font-bold text-gray-900">{formatDuration(getTicketDuration())}</p>
                    <span class="text-xs text-gray-500 font-medium">OPEN TIME</span>
                </div>
            </div>

            <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex flex-col items-center">
                    <p class="text-lg font-bold text-green-600">&lt;10m</p>
                    <span class="text-xs text-gray-500 font-medium">RESPONSE GOAL</span>
                </div>
            </div>
        </div>
    </div>
{/if}
-->
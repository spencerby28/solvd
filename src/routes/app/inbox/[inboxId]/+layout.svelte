<script lang="ts">
    import { page } from '$app/stores';
    import { tickets } from '$lib/stores/tickets';
    import TicketListItem from '$lib/components/inbox/TicketListItem.svelte';
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import Filter from "lucide-svelte/icons/filter";
    import ArrowUp from "lucide-svelte/icons/arrow-up";
    import Clock from "lucide-svelte/icons/clock";
    import Tag from "lucide-svelte/icons/tag";
    import Badge from '$lib/components/primatives/Badge.svelte';
    import { goto } from '$app/navigation';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import type { LayoutData } from './$types';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';
    import { writable } from 'svelte/store';
    import TextEditor from '$lib/components/inbox/TextEditor.svelte';
    
    


    

    $: console.log($selectedTicket);
    $: ticketId = $page.params.ticketId;

    export let data: LayoutData;





    $: activeFilters = Array.from($page.url.searchParams.getAll('filter'));

    $: currentTickets = (() => {
        let filtered = [...$tickets];

        // Hide SOLVD tickets by default unless showSolvd filter is active
        if (!activeFilters.includes('showSolvd')) {
            filtered = filtered.filter(ticket => 
                (ticket.status?.toLowerCase() || '') !== 'solvd'
            );
        }

        // Apply status filters
        const statusFilters = activeFilters.filter(f => 
            ['new', 'open', 'working', 'escalated'].includes(f)
        );
        if (statusFilters.length > 0) {
            filtered = filtered.filter(ticket => 
                statusFilters.includes(ticket.status?.toLowerCase() || '')
            );
        }

        // Apply sorting filters
        if (activeFilters.includes('recent')) {
            filtered.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
        } else if (activeFilters.includes('longest')) {
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else {
            // Default sort by last_active
            filtered.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
        }

        return filtered;
    })();

    $: loading = $tickets.length === 0;

    const statuses = [
        { label: 'NEW', value: 'NEW', color: '#7c3aed' },
        { label: 'OPEN', value: 'OPEN', color: '#2563eb' },
        { label: 'WORKING', value: 'WORKING', color: '#d97706' },
        { label: 'ESCALATED', value: 'ESCALATED', color: '#dc2626' },
        { label: 'SOLVD', value: 'SOLVD', color: '#16a34a' }
    ];

    let isOpen = false;

    function applyFilter(type: string, value: string) {
        const url = new URL(window.location.href);
        const currentFilters = url.searchParams.getAll('filter');
        
        // If filter already exists, remove it (toggle behavior)
        if (currentFilters.includes(value)) {
            const newFilters = currentFilters.filter(f => f !== value);
            url.searchParams.delete('filter');
            newFilters.forEach(f => url.searchParams.append('filter', f));
        } else {
            // Add new filter while keeping existing ones
            url.searchParams.append('filter', value);
        }
        
        goto(url.toString());
    }

    //TODO: actually filter the tickets, and make header taller on more than two or three filters
    //make sure heigh tof active filters doen't change header height on first adding a filter
</script>

<style>
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        background: transparent;
        display: none;
    }
</style>

<div class="flex h-full">
    <div class="w-[400px] flex-shrink-0 border-r border-gray-200 overflow-y-auto hide-scrollbar">
        <div class="mr-4 ml-3">
            <div class="sticky top-0 bg-white z-10 py-4 ">
                <div class="flex items-center justify-between">
                    <Dropdown.Root bind:open={isOpen}>
                        <Dropdown.Trigger class={`py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 ${activeFilters.length > 0 ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500'}`}>
                            <Filter class="h-4 w-4" />
                            <span>Filter{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}</span>
                        </Dropdown.Trigger>
                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 justify-between whitespace-nowrap" on:click={() => applyFilter('filter', 'showSolvd')}>
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span>Show Solvd</span>
                                </div>
                                {#if $page.url.searchParams.getAll('filter').includes('showSolvd')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </Dropdown.Item>
                            {#if activeFilters.length > 0}
                                <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 justify-between text-red-600 hover:bg-red-50" on:click={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('filter');
                                    goto(url.toString());
                                }}>
                                    <div class="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                        <span>Clear Filters</span>
                                    </div>
                                </Dropdown.Item>
                            {/if}
                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 justify-between" on:click={() => applyFilter('filter', 'recent')}>
                                <div class="flex items-center gap-2">
                                    <ArrowUp class="h-4 w-4" />
                                    <span>Most Recent</span>
                                </div>
                                {#if $page.url.searchParams.getAll('filter').includes('recent')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </Dropdown.Item>
                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 justify-between" on:click={() => applyFilter('filter', 'longest')}>
                                <div class="flex items-center gap-2">
                                    <Clock class="h-4 w-4" />
                                    <span>Longest Waiting</span>
                                </div>
                                {#if $page.url.searchParams.getAll('filter').includes('longest')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </Dropdown.Item>
                            <Dropdown.Sub>
                                <Dropdown.SubTrigger class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                                    <Tag class="h-4 w-4" />
                                    <span>Filter by Status</span>
                                </Dropdown.SubTrigger>
                                <Dropdown.SubContent class="bg-white border border-gray-200 rounded-lg shadow-lg">
                                    {#each statuses as status}
                                        <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between" on:click={() => applyFilter('filter', status.value.toLowerCase())}>
                                            <Badge text={status.label} color={status.color} />
                                            {#if $page.url.searchParams.getAll('filter').includes(status.value.toLowerCase())}
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                                </svg>
                                            {/if}
                                        </Dropdown.Item>
                                    {/each}
                                </Dropdown.SubContent>
                            </Dropdown.Sub>
                        </Dropdown.Content>
                    </Dropdown.Root>

                    <RippleButton 
                        class="p-2 rounded-lg border hover:bg-green-800 bg-green-600 border-white"
                        rippleColor="#16a34a"
                        duration="300ms"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-5 h-5 text-gray-500">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </RippleButton>
                </div>
            </div>

            {#if loading}
                {#each Array(3) as _}
                    <div class="block p-3 border-b border-gray-200 animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                {/each}
            {:else}
                {#each currentTickets as ticket}
                    <TicketListItem ticket={ticket} />
                {/each}
                
                {#if currentTickets.length === 0}
                    <div class="p-4 text-center text-gray-500">No tickets found</div>
                {/if}
            {/if}
        </div>
    </div>
    
    <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto hide-scrollbar">
            <slot />
        </div>
        {#if ticketId}
            <TextEditor user={data.user} />
        {/if}
    </div>
</div>
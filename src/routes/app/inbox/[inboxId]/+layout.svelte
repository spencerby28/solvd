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

    let messageContent = '';
    let isAgent = true;

    function handleSendMessage() {
        if (!messageContent.trim()) return;
        // TODO: Implement message sending logic
        messageContent = '';
    }

    function toggleSenderType() {
        isAgent = !isAgent;
    }

    $: currentTickets = $tickets;
    $: loading = currentTickets.length === 0;
    $: activeFilters = Array.from($page.url.searchParams.entries());

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
                <div class="flex items-center gap-2">
                    <Dropdown.Root bind:open={isOpen}>
                        <Dropdown.Trigger class="py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 text-gray-500">
                            <Filter class="h-4 w-4" />
                            <span>Filter</span>
                        </Dropdown.Trigger>
                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
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

                    {#if activeFilters.length > 0}
                        <div class="flex-1 flex items-center justify-between px-3 py-2 border border-gray-200 rounded-sm">
                            <span class="text-xs text-gray-500 uppercase tracking-wider">Active</span>
                            <div class="flex gap-2">
                                {#each activeFilters as [key, value]}
                                    <button 
                                        class="group" 
                                        on:click={() => applyFilter(key, value)}
                                    >
                                        <Badge 
                                            text={`${value.toUpperCase()} `} 
                                            color={statuses.find(s => s.value.toLowerCase() === value.toLowerCase())?.color || '#64748b'}
                                            onXClick={() => applyFilter(key, value)}
                                        />
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
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
        <div class="flex-shrink-0 p-4 bg-white border-t border-gray-200">
            <div class="flex gap-2 flex-col">
                <div class="flex items-center gap-3 mb-3">
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Reply
                        </div>
                    </RippleButton>
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                            </svg>
                            Edit
                        </div>
                    </RippleButton>
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                            </svg>
                            Reminder
                        </div>
                    </RippleButton>
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clip-rule="evenodd" />
                            </svg>
                            Help Desk
                        </div>
                    </RippleButton>
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            SolvdAI
                        </div>
                    </RippleButton>
                </div>
                <div class="flex gap-2">
                    <input
                        type="text"
                        bind:value={messageContent}
                        placeholder="Type your message..."
                        class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm min-h-[40px] outline-none transition-shadow duration-200"
                        on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <RippleButton 
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        on:click={handleSendMessage}
                        disabled={!messageContent.trim()}
                        rippleColor="#166534"
                        duration="1000ms"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </RippleButton>
                </div>
            </div>
        </div>
    </div>
</div>

<script lang="ts">
    import type { TicketDocument } from '$lib/stores/tickets';
    import { page } from '$app/stores';
    import type { TicketStatus } from '$lib/types';
    import Badge from '$lib/components/primatives/Badge.svelte';
    import * as Dropdown from '$lib/components/ui/dropdown-menu';
    import { selectedTicket } from '$lib/stores/selectedTicket';

    export let ticket: TicketDocument;

    $: isSelected = $page.params.ticketId === ticket.$id;
    $: {
        if (isSelected) {
            selectedTicket.set(ticket);
        }
    }
    const inboxId = $page.params.inboxId;
    $: queryParams = $page.url.searchParams.toString();
    console.log(queryParams);

    function getTimeAgo(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const diffMs = Date.now() - dateObj.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor(diffMs / (1000 * 60));

        if (hours < 1) {
            return `${minutes}m ago`;
        }
        if (hours < 24) {
            return `${hours}h ago`;
        }
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    const statusColors: Record<string, string> = {
        'NEW': '#7c3aed',
        'OPEN': '#2563eb', 
        'WORKING': '#d97706',
        'ESCALATED': '#dc2626',
        'SOLVD': '#16a34a'
    };

    let isDropdownOpen = false;
    let showDropdown = false;

    /*
    WANT TO: 
    MAKE SLIGHTLY TALLER, ENSURE HEIGHT OF DATE IS SAME OF HEIGH OF NAME, MAYBE BOLD THE NAME, MAKE TIGHTER TO ICON.
    MOVE TEXT OVER RIGHT A BIT, MAKE SURE IT TRUNCATES CORRECTLY.
     */
      
</script>

<a 
    href={`/app/inbox/${inboxId}/${ticket.$id}${queryParams ? '?' + queryParams : ''}`}
    class="block  pl-1 pr-3 py-3 mt-2 hover:bg-blue-50 border border-gray-200  cursor-pointer rounded-lg border-l-4 {isSelected ? 'border-l-blue-500 bg-blue-100' : ''}"
    on:mouseenter={() => showDropdown = true}
    on:mouseleave={() => showDropdown = false}
>
    <div class="flex justify-between items-center mb-1">
        <div class="flex items-center">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center">
                {#if ticket.channel === 'web'}

                    <img src="/svg/web.svg" alt="Web" class="w-4 h-4" />
                {:else if ticket.channel === 'email'}
                    <img src="/svg/email.svg" alt="Email" class="w-4 h-4" />
                {:else if ticket.channel === 'instagram'}
                    <img src="/svg/instagram.svg" alt="Instagram" class="w-4 h-4" />
                {:else if ticket.channel === 'chat' || ticket.channel === 'whatsapp'}
                    <img src="/svg/chat-active.svg" alt="Chat" class="w-4 h-4" />
                {/if}
            </div>
            <span class="text-sm text-gray-500 ml-1">
                {ticket.customer_name}
            </span>
        </div>
        <div class="relative">
            {#if !showDropdown && !isDropdownOpen}
                <span class="text-xs text-gray-400">
                    {getTimeAgo(ticket.last_active)}
                </span>
            {:else}
                <Dropdown.Root bind:open={isDropdownOpen}>
                    <Dropdown.Trigger class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                    </Dropdown.Trigger>
                    <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Mark as {ticket.status === ('SOLVD' as TicketStatus) ? 'Open' : 'Solved'}
                        </Dropdown.Item>
                        <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                                <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                            </svg>
                            Copy Link
                        </Dropdown.Item>
                        <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 008 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 00-11.908 0zM12.75 7.75a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z" />
                            </svg>
                            Block Customer
                        </Dropdown.Item>
                        <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                            </svg>
                            Delete Ticket
                        </Dropdown.Item>
                    </Dropdown.Content>
                </Dropdown.Root>
            {/if}
        </div>
    </div>

    <div class="flex justify-between items-start">
        <h3 class="font-medium text-gray-900 text-sm truncate ml-2">
            {ticket.subject || 'No Subject'}
        </h3>
        <Badge text={ticket.status?.toUpperCase()} color={statusColors[ticket.status?.toUpperCase() || ''] || 'gray'} />
    </div>
</a>
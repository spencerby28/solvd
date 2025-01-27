// derivedSelectedTicket.ts
import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { tickets } from '$lib/stores/tickets';

// Derive a store that always returns the ticket matching $page.params.ticketId
export const selectedTicket = derived([tickets, page], ([$tickets, $page]) => {
    const ticketId = $page.params.ticketId;
    return $tickets.find(t => t.$id === ticketId) ?? null;
});
import { writable } from 'svelte/store';
import type { Client, Databases, Models, RealtimeResponseEvent } from 'appwrite';
import type { Tickets } from '$lib/types';

export type TicketDocument = Tickets;

function createTicketsStore() {
    const { subscribe, set, update } = writable<TicketDocument[]>([]);

    return {
        subscribe,
        set,
        upsert: (ticket: TicketDocument) => {
            update(tickets => {
                const index = tickets.findIndex(t => t.$id === ticket.$id);
                if (index >= 0) {
                    tickets[index] = ticket;
                    return [...tickets];
                }
                return [...tickets, ticket];
            });
        },
        remove: (ticketId: string) => {
            update(tickets => tickets.filter(t => t.$id !== ticketId));
        },
        // Initialize with server data and setup realtime
        initialize: (client: Client, databases: Databases, initialTickets: TicketDocument[]) => {
            // Only initialize with server data if store is empty
            update(currentTickets => {
                if (currentTickets.length === 0) {
                    return initialTickets;
                }
                return currentTickets;
            });

            // Subscribe to realtime updates
            const unsubscribe = client.subscribe(
                'databases.tickets.collections.tickets.documents',
                (response: RealtimeResponseEvent<TicketDocument>) => {
                    const { events, payload } = response;
                    
                    if (events.some(e => e.includes('.create') || e.includes('.update'))) {
                        update(tickets => {
                            const index = tickets.findIndex(t => t.$id === payload.$id);
                            if (index >= 0) {
                                tickets[index] = payload;
                                return [...tickets];
                            }
                            return [...tickets, payload];
                        });
                    } else if (events.some(e => e.includes('.delete'))) {
                        update(tickets => tickets.filter(t => t.$id !== payload.$id));
                    }
                }
            );

            return unsubscribe;
        }
    };
}

export const tickets = createTicketsStore();

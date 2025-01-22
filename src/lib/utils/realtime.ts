import type { Client, Databases } from 'appwrite';
import type { Models } from 'appwrite';
import { tickets } from '$lib/stores/tickets';
import { messages } from '$lib/stores/messages';
import type { TicketDocument } from '$lib/stores/tickets';
import type { MessageDocument } from '$lib/stores/messages';

export type { TicketDocument, MessageDocument };

export function initializeRealtime(
    client: Client, 
    databases: Databases,
    initialTickets: TicketDocument[],
    initialMessages: MessageDocument[]
) {
    // Initialize both stores with initial data and setup realtime subscriptions
    const ticketsUnsubscribe = tickets.initialize(client, databases, initialTickets);
    const messagesUnsubscribe = messages.initialize(client, databases, initialMessages);

    // Return a cleanup function that unsubscribes from both
    return () => {
        ticketsUnsubscribe();
        messagesUnsubscribe();
    };
}

// Re-export the stores for convenience
export { tickets, messages }; 
import type { Client, Databases } from 'appwrite';
import type { Models } from 'appwrite';
import { tickets } from '$lib/stores/tickets';
import { messages } from '$lib/stores/messages';
import { customers } from '$lib/stores/customers';
import type { TicketDocument } from '$lib/stores/tickets';
import type { MessageDocument } from '$lib/stores/messages';
import type { CustomerDocument } from '$lib/stores/customers';

export type { TicketDocument, MessageDocument, CustomerDocument };

export function initializeRealtime(
    client: Client, 
    databases: Databases,
    initialTickets: TicketDocument[],
    initialMessages: MessageDocument[]
) {
    // Initialize stores with initial data and setup realtime subscriptions
    const ticketsUnsubscribe = tickets.initialize(client, databases, initialTickets);
    const messagesUnsubscribe = messages.initialize(client, databases, initialMessages);
    const customersUnsubscribe = customers.initialize(client, databases);

    // Return a cleanup function that unsubscribes from all
    return () => {
        ticketsUnsubscribe();
        messagesUnsubscribe();
        customersUnsubscribe();
    };
}

// Re-export the stores for convenience
export { tickets, messages, customers };
import { createSessionClient } from '$lib/appwrite';
import type { PageServerLoad } from './$types';
import { Query } from 'appwrite';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    const { ticketId } = event.params;
    const { databases } = createSessionClient(event);
    const allMessages = [];
    let lastId = null;
    
    try {
        // First get the ticket to get the customer_id
        const ticket = await databases.getDocument('tickets', 'tickets', ticketId);
        const customerId = ticket.customer_id;

        // Get the customer
      //  const customer = await databases.getDocument('tickets', 'customers', customerId);

        // Keep fetching messages until we get all of them
        while (true) {
            const queries = [
                Query.equal('ticket_id', ticketId),
                Query.orderAsc('$createdAt'),
                Query.limit(100)
            ];
            
            // Add cursor for pagination if we have a last ID
            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const messages = await databases.listDocuments('tickets', 'messages', queries);
            allMessages.push(...messages.documents);

            // If we got less than the limit, we've reached the end
            if (messages.documents.length < 100) {
                break;
            }

            // Set the last ID for the next iteration
            lastId = messages.documents[messages.documents.length - 1].$id;
        }

        console.log('Server found total number of messages:', allMessages.length);

        return {
            messages: allMessages,
            ticket: ticket
        };
    } catch (err: unknown) {
        console.error('Error fetching messages:', err);
        throw error(404, {
            message: 'Error loading messages'
        });
    }
}; 
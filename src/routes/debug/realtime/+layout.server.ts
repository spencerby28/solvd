import { createSessionClient } from '$lib/appwrite';
import type { LayoutServerLoad } from './$types';
import { Query } from 'appwrite';
export const load: LayoutServerLoad = async (event) => {
    try {
        const { databases } = createSessionClient(event);
        const [ticketsResponse, messagesResponse] = await Promise.all([
            databases.listDocuments('tickets', 'tickets'),
            databases.listDocuments('tickets', 'messages', [
                Query.limit(100)
            ])
        ]);
        
        return {
            tickets: ticketsResponse.documents,
            messages: messagesResponse.documents,
            ticketCount: ticketsResponse.total,
            messageCount: messagesResponse.total
        };
    } catch (error) {
        console.error('Error fetching tickets and messages:', error);
        return {
            tickets: [],
            messages: [],
            ticketCount: 0,
            messageCount: 0
        };
    }
};

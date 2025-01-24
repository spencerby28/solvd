import { createSessionClient } from '$lib/appwrite';
import type { PageServerLoad } from './$types';
import { Query } from 'appwrite';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    const { ticketId } = event.params;
    const { databases } = createSessionClient(event);
    
    try {
        const messages = await databases.listDocuments('tickets', 'messages', [
            Query.equal('ticket_id', ticketId),
            Query.orderAsc('$createdAt'),
            Query.limit(50)
        ]);

        return {
            messages: messages.documents
        };
    } catch (err: unknown) {
        console.error('Error fetching messages:', err);
        throw error(404, {
            message: 'Error loading messages'
        });
    }
}; 
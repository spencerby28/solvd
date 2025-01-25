import { createSessionClient } from '$lib/appwrite';
import type { LayoutServerLoad } from './$types';
import { Query } from 'appwrite';

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.user) {
        return {
            status: 302,
            redirect: '/overview'
        };
    }

    try {
        const { databases } = createSessionClient(event);

        // Get recent/pinned tickets
        const recentTickets = await databases.listDocuments('tickets', 'tickets', [
            Query.limit(100),
            Query.orderDesc('$createdAt')
        ]);


        // Get most recent messages for tickets
        const messages = await databases.listDocuments('tickets', 'messages', [
            Query.limit(100),
            Query.orderDesc('$createdAt')
        ]);

        console.log('[LAYOUT server load] initial tickets got inital data');

        // Group messages by ticket and get most recent
        const latestMessages = messages.documents.reduce((acc: Record<string, any>, message) => {
            if (!acc[message.ticket_id] || message.$createdAt > acc[message.ticket_id].$createdAt) {
                acc[message.ticket_id] = message;
            }
            return acc;
        }, {});
        
        return {
            user: event.locals.user,
          
            recentTickets: recentTickets.documents,
          
            messages: Object.values(latestMessages)
        };
    } catch (error) {
        console.error('Error fetching app data:', error);
        return {
            user: event.locals.user,
            ticketStats: {
                total: 0,
                unread: 0,
                assigned: 0
            },
            recentTickets: [],
            pinnedTickets: [],
            messages: []
        };
    }
};
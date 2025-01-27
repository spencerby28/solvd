import { createSessionClient } from '$lib/appwrite';
import type { LayoutServerLoad } from './$types';
import { Query } from 'appwrite';

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.user) {
        console.log('[LAYOUT server load] user not found');
        return {
            status: 302,
            redirect: '/'
        };
    }
    try {
        const { databases } = createSessionClient(event);
        const tenantId = event.locals.user.prefs.tenantId;
        const currentPath = event.url.pathname;
        
        // Fetch tenant data, tickets, and messages in parallel
        const [tenant, recentTickets, messages] = await Promise.all([
            databases.listDocuments('tenants', 'tenants', [
                Query.equal('$id', tenantId)
            ]),
            databases.listDocuments('tickets', 'tickets', [
                Query.limit(100),
                Query.orderDesc('$createdAt')
            ]),
            databases.listDocuments('tickets', 'messages', [
                Query.limit(100), 
                Query.orderDesc('$createdAt')
            ])
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
            tenant: tenant.documents[0],
            recentTickets: recentTickets.documents,
            messages: Object.values(latestMessages),
            currentPath
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
            messages: [],
            currentPath: event.url.pathname
        };
    }
};
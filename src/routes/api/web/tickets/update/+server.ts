import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/appwrite';


export const POST: RequestHandler = async ({ request, url }) => {
    try {
        console.log('[Ticket Update] Starting ticket update');
        const status = url.searchParams.get('status');
        const { ticketId } = await request.json();

        console.log('[Ticket Update] Received params:', { status, ticketId });

        if (!ticketId) {
            console.log('[Ticket Update] Missing ticket ID');
            return json({ error: 'Ticket ID is required' }, { status: 400 });
        }

        if (status) {
            console.log('[Ticket Update] Updating ticket status');
            const { databases } = createAdminClient();
            // Update ticket status
            await databases.updateDocument(
                'tickets',
                'tickets',
                ticketId,
                {
                    status: status
                }
            );
            console.log('[Ticket Update] Successfully updated ticket status');
        }

        console.log('[Ticket Update] Completed successfully');
        return json({ success: true });

    } catch (error) {
        console.error('[Ticket Update] Error updating ticket:', error);
        return json({ error: 'Failed to update ticket' }, { status: 500 });
    }
};

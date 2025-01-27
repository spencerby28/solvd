import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/appwrite';
import { ID, Permission, Role } from 'appwrite';

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        console.log('[Ticket Update] Starting ticket update');
        const status = url.searchParams.get('status')?.toUpperCase();
        const { ticketId, userName } = await request.json();

        console.log('[Ticket Update] Received params:', { status, ticketId });

        if (!ticketId) {
            console.log('[Ticket Update] Missing ticket ID');
            return json({ error: 'Ticket ID is required' }, { status: 400 });
        }

        if (status) {
            console.log('[Ticket Update] Updating ticket status');
            const { databases } = createAdminClient();

            // Get existing ticket
            const ticket = await databases.getDocument(
                'tickets',
                'tickets',
                ticketId
            );

            // Generate unique ID for internal message
            const messageId = ID.unique();

            // Create internal message
            const internalMessage = {
                content: `${userName} set status to ${status}`,
                sender_type: 'system',
                sender_id: 'system',
                channel: 'web',
                sender_name: 'System',
                ticket_id: ticketId,
                tenant_id: ticket.tenant_id,
                internal: true
            };

            // Update ticket status and append internal message ID
            await databases.updateDocument(
                'tickets',
                'tickets',
                ticketId,
                {
                    status: status,
                    internal_messages: [...(ticket.internal_messages || []), messageId]
                }
            );

            // Create message document with permissions
            await databases.createDocument(
                'tickets',
                'messages',
                messageId,
                {
                    ...internalMessage,
                    ticket_id: ticketId
                },
                [
                    Permission.write(Role.team(ticket.tenant_id)),
                    Permission.read(Role.team(ticket.tenant_id)),
                ]
            );

            console.log('[Ticket Update] Successfully updated ticket status and created internal message');
        }

        console.log('[Ticket Update] Completed successfully');
        return json({ success: true });

    } catch (error) {
        console.error('[Ticket Update] Error updating ticket:', error);
        return json({ error: 'Failed to update ticket' }, { status: 500 });
    }
};

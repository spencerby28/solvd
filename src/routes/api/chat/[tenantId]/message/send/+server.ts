import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/appwrite';
import { ID, Permission, Role } from 'appwrite';

export const POST: RequestHandler = async (event) => {
    console.log('user name', event.locals.user?.name);
    const body = await event.request.json();
    const { message, ticketId } = body;
    const tenantId = event.params.tenantId;

    if (!message || !tenantId || !ticketId) {
        throw error(400, 'Message, tenant ID, and ticket ID are required');
    }

	console.log('message', message);
	console.log('ticketId', ticketId);
	console.log('tenantId', tenantId);

    try {
        const { databases } = createAdminClient();
        const userId = event.locals.user?.$id;

        if (!userId) {
            throw error(401, 'Unauthorized');
        }

        // Create customer message
        const messageId = ID.unique();
        await databases.createDocument(
            'tickets',
            'messages',
            messageId,
            {
                ticket_id: ticketId,
                content: message,
                sender_id: userId,
                sender_name: event.locals.user?.name || 'Anonymous',
                sender_type: 'customer',
                channel: 'chat',
                tenant_id: tenantId,
                read_status: false
            },
            [Permission.read(Role.team(tenantId)), Permission.read(Role.user(userId))]
        );

        return json({ success: true });
    } catch (err) {
        console.error('Error creating message:', err);
        throw error(500, 'Failed to create message');
    }
};


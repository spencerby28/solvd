import { json } from '@sveltejs/kit';
import { ID, Permission, Role } from 'node-appwrite';
import { createAdminClient } from '$lib/appwrite';

export async function POST({ request }) {
    const { tenant_id, ticket_id, sender_type } = await request.json();

    if (!tenant_id || !ticket_id || !sender_type) {
        return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { databases } = createAdminClient();

    try {
        const messageId = ID.unique();

        const [message, ticket] = await Promise.all([
            databases.createDocument(
                'tickets',
                'messages',
                messageId,
                {
                    content: 'New message',
                    sender_id: sender_type === 'system' ? 'system' : ID.unique(),
                    sender_name: sender_type === 'system' ? 'System' : 'Customer',
                    sender_type,
                    source: 'web_widget',
                    attachments: [],
                    read_status: false,
                    edited: false,
                    ticket_id,
                    tenant_id
                },
                [
                    Permission.read(Role.team(tenant_id)),
                    Permission.update(Role.team(tenant_id)),
                    Permission.write(Role.team(tenant_id, 'admin'))
                ]
            ),

            // Get ticket in parallel
            databases.getDocument('tickets', 'tickets', ticket_id)
        ]);
        const messages = [...(ticket.messages || []), messageId];
        
        await databases.updateDocument(
            'tickets',
            'tickets',
            ticket_id,
            { messages }
        );

        console.log('Successfully created message:', messageId, 'for ticket:', ticket_id);
        return json({ success: true, message });

    } catch (error) {
        console.error('Error creating message:', error);
        return json({ success: false, error: 'Failed to create message' }, { status: 500 });
    }
}

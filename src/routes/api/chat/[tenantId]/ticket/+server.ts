import { ID, Permission, Role } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, Tickets } from '$lib/types';

export async function POST({ request, params }) {
    const { tenantId } = params;
    const { sessionId, category, initialMessage } = await request.json();
    const databases = createAdminClient().databases;

    try {
        const ticketId = ID.unique();
        const messageId = ID.unique();

        // Create ticket and initial message in parallel
        const [ticket] = await Promise.all([
            databases.createDocument(
                'tickets',
                'tickets',
                ticketId,
                {
                    customer_id: 'anonymous', // Will be updated when customer identifies
                    channel: 'web_widget',
                    category: category || 'general',
                    last_active: new Date().toISOString(),
                    customer_name: 'Anonymous User',
                    customer_last_seen: new Date().toISOString(),
                    customer_locale: 'en-US',
                    customer_timezone: 'UTC',
                    messages: [messageId],
                    assigned_to: null,
                    assigned_name: null,
                    internal_messages: [],
                    subject: initialMessage.substring(0, 100),
                    tenant_id: tenantId,
                    priority: 'medium',
                    status: 'new',
                    pinned: false,
                    last_message: initialMessage,
                    replied: false
                },
                [
                    Permission.read(Role.team(tenantId)),
                    Permission.update(Role.team(tenantId)),
                    Permission.write(Role.team(tenantId, 'admin'))
                ]
            ),
            databases.createDocument(
                'tickets',
                'messages',
                messageId,
                {
                    content: initialMessage,
                    sender_id: 'anonymous',
                    sender_name: 'Anonymous User',
                    sender_type: 'customer',
                    channel: 'web_widget',
                    ticket_id: ticketId,
                    tenant_id: tenantId,
                    attachments: [],
                    read_status: false,
                    edited: false
                },
                [
                    Permission.read(Role.team(tenantId)),
                    Permission.update(Role.team(tenantId)),
                    Permission.write(Role.team(tenantId, 'admin'))
                ]
            ),
            // Update chat session with ticket ID
            databases.updateDocument(
                'tickets',
                'chat_sessions',
                sessionId,
                {
                    ticket_id: ticketId
                }
            )
        ]);

        return json({ success: true, id: ticketId });

    } catch (error) {
        console.error('Error creating chat ticket:', error);
        return json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
    }
}

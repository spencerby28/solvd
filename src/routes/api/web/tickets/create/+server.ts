import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public';
import { APPWRITE_KEY } from '$env/static/private';

export async function GET({ url }) {
    const tenant = url.searchParams.get('tenant');
    if (!tenant) {
        return json({ success: false, error: 'Tenant is required' }, { status: 400 });
    }

    // Initialize Appwrite client
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)
        .setKey(APPWRITE_KEY);

    const databases = new Databases(client);

    try {
        // Create ticket and initial message in parallel
        const ticketId = ID.unique();
        const messageId = ID.unique();

        await Promise.all([
            databases.createDocument(
                'tickets',
                'tickets', 
                ticketId,
                {
                    customer_id: 'sample-customer-123',
                    channel: 'web',
                    category: 'support', 
                    last_active: new Date().toISOString(),
                    messages: [],
                    customer_name: 'John Doe',
                    customer_last_seen: new Date().toISOString(),
                    customer_locale: 'en-US',
                    customer_timezone: 'America/New_York',
                    assigned_to: null,
                    assigned_name: null,
                    subject: 'Sample Support Ticket',
                    internal_messages: [],
                    tenant_id: tenant,
                    priority: 'low',
                    status: 'open'
                },
                [
                    Permission.read(Role.team(tenant)),
                    Permission.update(Role.team(tenant)), 
                    Permission.write(Role.team(tenant, 'admin'))
                ]
            ),

            databases.createDocument(
                'tickets',
                'messages',
                messageId,
                {
                    content: 'Ticket created',
                    sender_id: 'system',
                    sender_name: 'System',
                    sender_type: 'system',
                    source: 'web_widget',
                    attachments: [],
                    read_status: false,
                    edited: false,
                    ticket_id: ticketId,
                    tenant_id: tenant
                },
                [
                    Permission.read(Role.team(tenant)),
                    Permission.update(Role.team(tenant)),
                    Permission.write(Role.team(tenant, 'admin'))
                ]
            )
        ]);

        // Update ticket with the message ID
        const updatedTicket = await databases.updateDocument(
            'tickets',
            'tickets',
            ticketId,
            {
                messages: [messageId]
            }
        );

        return json({ success: true, ticket: updatedTicket });

    } catch (error) {
        console.error('Error creating ticket:', error);
        return json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
    }
}

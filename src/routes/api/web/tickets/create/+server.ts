import { ID, Permission, Role } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';

export async function GET({ url }) {
    const tenant = url.searchParams.get('tenant');
    if (!tenant) {
        return json({ success: false, error: 'Tenant is required' }, { status: 400 });
    }

    // Sample data arrays
    const channels = ['web', 'email', 'phone', 'chat', 'social'];
    const categories = ['support', 'billing', 'technical', 'sales', 'feature_request', 'bug_report'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['new', 'open', 'pending', 'resolved', 'closed'];
    const customerNames = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Williams', 'Mike Brown'];
    const subjects = [
        'Need help with login',
        'Billing question',
        'Feature not working',
        'Account access issue',
        'Integration problem',
        'Service disruption'
    ];
    const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'];
    const locales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];
    const initialMessages = [
        'Hi, I need some help with this issue.',
        "Hello, I'm having trouble with your service.",
        'Can someone help me please?',
        "I'm experiencing some problems.",
        'Need assistance with my account.',
        'Having technical difficulties.'
    ];
    const emails = [
        'john.doe@example.com',
        'jane.smith@example.com',
        'alex.johnson@example.com',
        'sarah.williams@example.com',
        'mike.brown@example.com'
    ];
    const customerStatuses = ['active', 'inactive', 'blocked'];

    // Random selection helper
    const randomChoice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    // Initialize Appwrite client
    const { databases } = createAdminClient();

    try {
        // Create ticket, message and customer in parallel
        const ticketId = ID.unique();
        const messageId = ID.unique();
        const customerId = ID.unique();
        const customerName = randomChoice(customerNames);
        const channel = randomChoice(channels);
        const customerLocale = randomChoice(locales);
        const customerTimezone = randomChoice(timezones);

        await Promise.all([
            // Create customer
            databases.createDocument(
                'tickets',
                'customers',
                customerId,
                {
                    name: customerName,
                    email: randomChoice(emails),
                    locale: customerLocale,
                    timezone: customerTimezone,
                    instagram_id: null,
                    instagram_username: null,
                    shopify_id: null,
                    tickets: [ticketId],
                    status: randomChoice(customerStatuses),
                    tenant_id: tenant
                },
                [
                    Permission.read(Role.team(tenant)),
                    Permission.update(Role.team(tenant)),
                    Permission.write(Role.team(tenant, 'admin'))
                ]
            ),

            // Create ticket
            databases.createDocument(
                'tickets',
                'tickets', 
                ticketId,
                {
                    customer_id: customerId,
                    channel: channel,
                    category: randomChoice(categories),
                    last_active: new Date().toISOString(),
                    messages: [],
                    customer_name: customerName,
                    customer_last_seen: new Date().toISOString(),
                    customer_locale: customerLocale,
                    customer_timezone: customerTimezone,
                    assigned_to: null,
                    assigned_name: null,
                    subject: randomChoice(subjects),
                    internal_messages: [],
                    tenant_id: tenant,
                    priority: randomChoice(priorities),
                    status: randomChoice(statuses)
                },
                [
                    Permission.read(Role.team(tenant)),
                    Permission.update(Role.team(tenant)), 
                    Permission.write(Role.team(tenant, 'admin'))
                ]
            ),

            // Create message
            databases.createDocument(
                'tickets',
                'messages',
                messageId,
                {
                    content: randomChoice(initialMessages),
                    sender_id: customerId,
                    sender_name: customerName,
                    sender_type: 'customer',
                    source: channel,
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

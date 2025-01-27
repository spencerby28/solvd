import { ID, Permission, Role, Query } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, Tickets } from '$lib/types';
import type { Databases } from 'node-appwrite';

interface ChatData {
    customerId: string;
    ticketId: string;
    tenantId: string;
    name: string;
    type?: string;
}

async function createTicket(
    databases: Databases,
    params: {
        customerId: string;
        ticketId: string;
        senderName: string;
        tenantId: string;
        type?: string;
    }
): Promise<Tickets> {
    return databases.createDocument(
        'tickets',
        'tickets',
        params.ticketId,
        {
            customer_id: params.customerId,
            channel: 'chat',
            category: params.type || 'support',
            last_active: new Date().toISOString(),
            messages: [], // Will be populated with first message
            customer_name: params.senderName,
            customer_last_seen: new Date().toISOString(),
            customer_locale: 'en-US',
            customer_timezone: 'UTC',
            assigned_to: null,
            assigned_name: null,
            subject: `Chat with ${params.senderName}`,
            internal_messages: [],
            tenant_id: params.tenantId,
            priority: 'medium',
            status: 'new'
        },
        [
            Permission.read(Role.team(params.tenantId)),
            Permission.update(Role.team(params.tenantId)),
            Permission.write(Role.team(params.tenantId, 'admin'))
        ]
    ) as Promise<Tickets>;
}

export async function POST({ request }) {
    const chatData: ChatData = await request.json();
    console.log('chatData', chatData);
    const tenant = chatData.tenantId;
    
    if (!tenant) {
        return json({ success: false, error: 'Tenant is required' }, { status: 400 });
    }

    const databases = createAdminClient().databases;

    try {
        console.log('chatData', chatData);
        const ticket = await createTicket(databases, {
            ticketId: chatData.ticketId,
            customerId: chatData.customerId,
            senderName: chatData.name || 'Anonymous',
            tenantId: chatData.tenantId,
            type: chatData.type
        });

        return json({ 
            success: true, 
            ticketId: chatData.ticketId,
            messages: []
        });

    } catch (error) {
        console.error('Error creating chat ticket:', error);
        return json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
    }
}

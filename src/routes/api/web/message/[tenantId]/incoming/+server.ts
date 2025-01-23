import { ID, Permission, Role } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, Tickets } from '$lib/types';
import type { Databases } from 'node-appwrite';

interface MessageData {
    ticketId: string;
    content: string;
    senderId: string;
    senderName: string;
}

function cleanEmailBody(body: string): string {
    // Remove email client quoted content
    const lines = body.split('\n');
    const cleanedLines = [];
    
    for (const line of lines) {
        // Stop at common email client quote markers
        if (line.match(/^>|On .* wrote:|Begin forwarded message/)) {
            break;
        }
        cleanedLines.push(line);
    }
    
    return cleanedLines.join('\n').trim();
}

async function appendMessageToTicket(
    databases: Databases,
    ticketId: string,
    messageId: string,
    content: string,
    senderId: string,
    senderName: string,
    tenant: string
): Promise<void> {
    console.log(`[appendMessageToTicket] Starting for ticket ${ticketId}`);
    
    const ticket = await databases.getDocument('tickets', 'tickets', ticketId) as Tickets;
    console.log(`[appendMessageToTicket] Retrieved ticket:`, ticket);

    // Clean the content before saving
    const cleanedContent = cleanEmailBody(content);
    console.log(`[appendMessageToTicket] Cleaned content:`, cleanedContent);

    // Create new message
    console.log(`[appendMessageToTicket] Creating new message with ID ${messageId}`);
    await databases.createDocument(
        'tickets',
        'messages',
        messageId,
        {
            content: cleanedContent,
            sender_id: senderId,
            sender_name: senderName,
            sender_type: 'customer',
            channel: 'email',
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
    );
    console.log(`[appendMessageToTicket] Created message document`);

    // Update ticket's messages array and last active time
    console.log(`[appendMessageToTicket] Updating ticket ${ticketId} with new message`);
    await databases.updateDocument('tickets', 'tickets', ticketId, {
        messages: [...(ticket.messages || []), messageId],
        last_active: new Date().toISOString()
    });
    console.log(`[appendMessageToTicket] Successfully updated ticket`);
}

export async function POST({ request, params }) {
    const tenant = params.tenantId;
    if (!tenant) {
        return json({ success: false, error: 'Tenant is required' }, { status: 400 });
    }

    try {
        const messageData: MessageData = await request.json();
        const {databases} = createAdminClient();

        // Create and append the message
        const messageId = ID.unique();
        await appendMessageToTicket(
            databases,
            messageData.ticketId,
            messageId,
            messageData.content,
            messageData.senderId,
            messageData.senderName,
            tenant
        );

        return json({ success: true, messageId });
    } catch (error) {
        console.error('Error handling incoming message:', error);
        return json({ success: false, error: 'Failed to process message' }, { status: 500 });
    }
}

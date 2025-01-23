import { json } from '@sveltejs/kit';
import { ID, Permission, Role, Query } from 'node-appwrite';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, CreateMessagePayload } from '$lib/types';

export async function POST({ request, params, fetch }) {
    console.log('Received message creation request');
    const messageData: CreateMessagePayload = await request.json();
    const tenant_id = params.tenantId;

    console.log('Message data:', messageData);
    console.log('Tenant ID:', tenant_id);

    if (!tenant_id || !messageData.ticket_id) {
        console.error('Missing required fields:', { tenant_id, ticket_id: messageData.ticket_id });
        return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { databases } = createAdminClient();
    console.log('Created admin client');

    try {
        const messageId = ID.unique();
        console.log('Generated message ID:', messageId);

        // Create the full message document from the payload
        const messageDoc: Partial<Messages> = {
            ...messageData,
            read_status: false,
            edited: false
        };
        console.log('Prepared message document:', messageDoc);

        // Create message first
        console.log('Creating message');
        const message = await databases.createDocument(
            'tickets',
            'messages',
            messageId,
            messageDoc,
            [
                Permission.read(Role.team(tenant_id)),
                Permission.update(Role.team(tenant_id)),
                Permission.write(Role.team(tenant_id, 'admin'))
            ]
        );
        console.log('Message created:', message.$id);

        // Handle different channels
        if (messageData.channel === 'email' && messageData.email) {
            console.log('Processing email channel message');
            // Get full message history for email
            const existingMessages = await databases.listDocuments(
                'tickets',
                'messages',
                [
                    Query.equal('ticket_id', messageData.ticket_id),
                    Query.orderAsc('$createdAt')
                ]
            );
            console.log('Retrieved existing messages:', existingMessages.documents.length);

            // Add the newly created message to the history
            const allMessages = [...existingMessages.documents, message];
 
            await databases.updateDocument(
                'tickets',
                'tickets', 
                messageData.ticket_id,
                {
                    messages: allMessages.map(msg => msg.$id), // Store just the message IDs
                    last_active: new Date().toISOString()
                }
            );
            console.log('Ticket updated successfully');

            // Send email with full history including new message
            console.log('Sending email notification');
            const emailResponse = await fetch(`/api/email/${tenant_id}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticketId: messageData.ticket_id,
                    messages: existingMessages.documents,
                    recipient: messageData.email,
                    subject: messageData.subject,
                    tenantId: tenant_id,
                })
            });

            if (!emailResponse.ok) {
                const error = await emailResponse.json();
                console.error('Failed to send email:', error);
                throw new Error('Failed to send email notification');
            }
            console.log('Email notification sent');
        }

        // Get and update ticket


        return json({ success: true, message });

    } catch (error) {
        console.error('Error creating message:', error);
        return json({ success: false, error: 'Failed to create message' }, { status: 500 });
    }
}

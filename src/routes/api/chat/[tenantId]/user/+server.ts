import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import { Query } from 'appwrite';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
    try {
        const { ticketId, name } = await request.json();
        const { databases, users } = createAdminClient();

        // Update user name in Appwrite
        if (locals.user?.$id) {
            await users.updateName(locals.user.$id, name);
        }

        // Get all messages for this ticket
        const messages = await databases.listDocuments(
            'tickets',
            'messages',
            [Query.equal('ticket_id', ticketId)]
        );

        // Update sender_name for all messages from this customer
        const updatePromises = messages.documents
            .filter(msg => msg.sender_type === 'customer')
            .map(msg => 
                databases.updateDocument(
                    'tickets',
                    'messages',
                    msg.$id,
                    { sender_name: name }
                )
            );

        // Check if ticket exists before updating
        try {
            const ticket = await databases.getDocument(
                'tickets',
                'tickets', 
                ticketId
            );
            
            // Only update ticket if it exists
            if (ticket) {
                updatePromises.push(
                    databases.updateDocument(
                        'tickets',
                        'tickets',
                        ticketId,
                        { customer_name: name }
                    )
                );
            }
        } catch (err) {
            // Ticket doesn't exist yet, skip updating it
            console.log('Ticket not found, skipping update');
        }

        await Promise.all(updatePromises);

        return json({ success: true });

    } catch (error) {
        console.error('Error updating names:', error);
        return json({ error: 'Failed to update names' }, { status: 500 });
    }
};

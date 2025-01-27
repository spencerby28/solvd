import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';

export async function DELETE({ params, request }) {
    try {
        const { ticketId, messageId } = await request.json();

        const { databases } = createAdminClient();

        // Delete the message document
        await databases.deleteDocument(
            'tickets',
            'messages', 
            messageId
        );

        // Get the ticket to update its messages array
        const ticket = await databases.getDocument(
            'tickets',
            'tickets',
            ticketId
        );

        // Remove the messageId from the appropriate array
        if (ticket.messages && ticket.messages.includes(messageId)) {
            const updatedMessages = ticket.messages.filter((id: string) => id !== messageId);
            await databases.updateDocument(
                'tickets',
                'tickets',
                ticketId,
                {
                    messages: updatedMessages
                }
            );
        }

        if (ticket.internal_messages && ticket.internal_messages.includes(messageId)) {
            const updatedInternalMessages = ticket.internal_messages.filter((id: string) => id !== messageId);
            await databases.updateDocument(
                'tickets',
                'tickets',
                ticketId,
                {
                    internal_messages: updatedInternalMessages
                }
            );
        }

        return json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        return json({
            success: false,
            message: 'Failed to delete message'
        }, { status: 500 });
    }
}

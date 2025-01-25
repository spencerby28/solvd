import { createAnonClient } from '$lib/appwrite';
import { json } from '@sveltejs/kit';

export async function POST({ request, params }) {
    const { tenantId, messageId } = params;
    const { sessionId, timestamp } = await request.json();
    const { databases } = createAnonClient();

    try {
        // Update message read status
        await databases.updateDocument(
            'tickets',
            'messages',
            messageId,
            {
                read_status: true
            }
        );

        // Update chat session last activity if provided
        if (sessionId) {
            await databases.updateDocument(
                'tickets',
                'chat_sessions',
                sessionId,
                {
                    last_activity: timestamp
                }
            );
        }

        return json({ success: true });

    } catch (error) {
        console.error('Error updating message read status:', error);
        return json({ error: 'Failed to update message' }, { status: 500 });
    }
}
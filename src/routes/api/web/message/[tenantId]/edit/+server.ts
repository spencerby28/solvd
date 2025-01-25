import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/appwrite';

export const POST: RequestHandler = async ({ request, params }) => {
    try {
        console.log('[Message Edit] Received edit request');
        const { messageId, content } = await request.json();
        console.log('[Message Edit] Message ID:', messageId);
        console.log('[Message Edit] New content:', content);

        const tenantId = params.tenantId;
        console.log('[Message Edit] Tenant ID:', tenantId);

        if (!messageId || !content?.trim()) {
            console.warn('[Message Edit] Missing required fields');
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const {databases} = createAdminClient();
        console.log('[Message Edit] Created admin client');

        // Update the message in the database
        console.log('[Message Edit] Updating message in database...');
        const updatedMessage = await databases.updateDocument(
            'tickets',
            'messages',
            messageId,
            {
                content: content.trim()
            }
        );
        console.log('[Message Edit] Successfully updated message:', updatedMessage);

        return json(updatedMessage);

    } catch (error) {
        console.error('[Message Edit] Error updating message:', error);
        return json({ error: 'Failed to update message' }, { status: 500 });
    }
};

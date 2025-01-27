import { createAdminClient } from '$lib/appwrite';
import { ID } from 'appwrite';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
    const { databases } = createAdminClient();
    const { tenantId, ticketId } = params;
    
    try {
        await databases.updateDocument(
            'tickets',
            'tickets',
            ticketId,
            {
                customer_last_seen: new Date().toISOString()
            }
        );
        return json({ success: true });
    } catch (error) {
        console.error('Error updating last seen:', error);
        return json({ success: false }, { status: 500 });
    }
}; 
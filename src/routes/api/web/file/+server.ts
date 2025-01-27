import { json } from '@sveltejs/kit';
import { Permission, Role } from 'appwrite';
import { createAdminClient } from '$lib/appwrite';

export async function POST({ request }) {
    try {
        const { fileId, tenantId, customerId } = await request.json();

        if (!fileId || !tenantId || !customerId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { storage } = createAdminClient();

        await storage.updateFile(
            tenantId, // bucket ID is tenant ID
            fileId,
            undefined, // name parameter is optional
            [
                Permission.read(Role.any()),
                Permission.read(Role.team(tenantId)), // Team can read
                Permission.read(Role.user(customerId)) // Customer can read
            ]
        );

        return json({ success: true });

    } catch (error) {
        console.error('Error updating file permissions:', error);
        return json({ error: 'Failed to update file permissions' }, { status: 500 });
    }
}

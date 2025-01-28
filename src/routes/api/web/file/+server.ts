import { json } from '@sveltejs/kit';
import { Permission, Role } from 'appwrite';
import { createAdminClient } from '$lib/appwrite';
import { PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

export async function POST({ request }) {
    try {
        const { fileId, tenantId, customerId, userId, avatar } = await request.json();

        if (!fileId || !tenantId || !customerId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { storage, databases, users } = createAdminClient();

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

        if (avatar && userId) {
            // Get file data first to check mime type
            const fileData = await storage.getFile(tenantId, fileId);
            
            if (!fileData.mimeType.startsWith('image/')) {
                return json({ error: 'File must be an image for avatar' }, { status: 400 });
            }

            // Construct the preview URL directly using the endpoint URL
            const previewUrl = `${PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${tenantId}/files/${fileId}/preview?project=solvd`;

            console.log(previewUrl);

            let prefs = await users.getPrefs(userId);
            // Update agent document and user prefs with avatar URL in parallel
            await Promise.all([
                databases.updateDocument(
                    'tenants',
                    'agents',
                    userId,
                    {
                        avatar_url: previewUrl
                    }
                ),
             
                users.updatePrefs(
                    userId,
                    {
                        ...prefs,
                        avatar_url: previewUrl
                    }
                )
            ]);
        }

        return json({ success: true });

    } catch (error) {
        console.error('Error updating file permissions:', error);
        return json({ error: 'Failed to update file permissions' }, { status: 500 });
    }
}

import { ID } from 'appwrite';
import { createBrowserClient } from '$lib/appwrite-browser';

export async function uploadFile(file: File, customerId?: string, tenantId?: string, userId?: string, avatar?: boolean) {
    const { storage, databases } = createBrowserClient();

    try {
        // Upload the file to the tenant's bucket
        const uploadedFile = await storage.createFile(
            //@ts-ignore
            tenantId, // bucket ID is the tenant ID
            ID.unique(),
            file
        );

        // Update file permissions via server endpoint
        const response = await fetch('/api/web/file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: uploadedFile.$id,
                tenantId,
                customerId,
                userId, 
                avatar
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update file permissions');
        }

 

        return uploadedFile.$id;

    } catch (error) {
        if (error instanceof Error) {
            console.error('Appwrite Error:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
        } else {
            console.error('Unknown Error:', error);
        }
        throw error;
    }
}

import { createAdminClient } from '$lib/appwrite';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { Query } from 'node-appwrite';
const { storage } = createAdminClient();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return redirect(302, '/login');
    }
    const tenantId = locals.user.prefs.tenantId;

    try {
        const response = await storage.listFiles(tenantId, [
            Query.orderAsc('$createdAt'),
            Query.endsWith('name', '.pdf'),
            Query.limit(6)
        ]);
        return {
            documents: response.files
        };
    } catch (error) {
        console.error('Error fetching documents:', error);
        return {
            documents: []
        };
    }
};

export const actions: Actions = {
    deleteDocument: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { success: false, message: 'Unauthorized' });
        }

        const data = await request.formData();
        const fileId = data.get('fileId');
        const tenantId = locals.user.prefs.tenantId;

        if (!fileId) {
            return fail(400, { success: false, message: 'File ID is required' });
        }

        try {
            await storage.deleteFile(tenantId, fileId.toString());
            return { success: true };
        } catch (error) {
            console.error('Error deleting document:', error);
            return fail(500, { success: false, message: 'Failed to delete document' });
        }
    }
};

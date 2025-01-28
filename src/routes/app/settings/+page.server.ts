import { createAdminClient } from '$lib/appwrite';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Query } from 'appwrite';

export const load: PageServerLoad = async ({ parent }) => {
    const parentData = await parent();
    const tenant = parentData.tenant;

    if (!tenant) {
        throw error(404, 'Tenant not found');
    }

    try {
        const { databases } = createAdminClient();

        const response = await databases.listDocuments(
            'tenants',
            'agents',
            [Query.equal('tenant_id', tenant.$id), Query.limit(100)]
        );

        return {
            agents: response.documents
        };

    } catch (err) {
        console.error('Error loading agent data:', err);
        throw error(500, 'Error loading agent data');
    }
};

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
        
        // Get all agent details for the user_ids
        const agentPromises = tenant.user_ids.map(async (userId: string) => {
            const response = await databases.listDocuments(
                'tenants',
                'agents',
                [Query.equal('$id', userId)]
            );
            return response.documents[0];
        });

        const agents = await Promise.all(agentPromises);

        return {
            agents: agents.filter(agent => agent) // Remove any null results
        };

    } catch (err) {
        console.error('Error loading agent data:', err);
        throw error(500, 'Error loading agent data');
    }
};

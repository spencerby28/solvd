import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSessionClient } from '$lib/appwrite';
import { Query } from 'appwrite';

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const client = createSessionClient({ cookies });
        
        const customers = await client.databases.listDocuments(
            'tickets',
            'customers',
            [
                Query.limit(25)
            ]
        );

        return {
            initialCustomers: customers.documents
        };
    } catch (e) {
        console.error('Error fetching customers:', e);
        throw error(500, 'Error fetching customers');
    }
};

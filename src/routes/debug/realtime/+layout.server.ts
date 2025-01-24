import { createSessionClient } from '$lib/appwrite';
import type { LayoutServerLoad } from './$types';
import { Query } from 'appwrite';
export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.user) {
        return {
            status: 302,
            redirect: '/overview'
        };
    }
};

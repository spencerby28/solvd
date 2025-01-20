import { SESSION_COOKIE, createSessionClient } from '$lib/appwrite';
import { redirect, type Actions } from '@sveltejs/kit';

export async function load({ locals }) {
    // Logged out users can't access this page
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    // Pass the stored user local to the page
    return {
        user: locals.user
    };
}

export const actions = {
    default: async (event) => {
        // Create the Appwrite client
        const { account } = createSessionClient(event);

        // Delete the session on Appwrite, and delete the session cookie
        await account.deleteSession('current');
        event.cookies.delete(SESSION_COOKIE, { path: '/' });

        // Redirect to the sign up page
        throw redirect(302, '/register');
    }
} satisfies Actions;

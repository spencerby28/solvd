import { SESSION_COOKIE, createAdminClient } from '$lib/appwrite';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    const sessionCookie = cookies.get(SESSION_COOKIE);
    
    if (!sessionCookie) {
        const { account } = createAdminClient();
        try {
            // Create anonymous session
            const session = await account.createAnonymousSession();

            // Set the session cookie
            cookies.set(SESSION_COOKIE, session.secret, {
                sameSite: 'strict',
                expires: new Date(session.expire),
                secure: true,
                path: '/',
                httpOnly: true
            });
        } catch (error) {
            console.error('Anonymous session creation error:', error);
            throw error;
        }
    }

    return redirect(302, `/chat`);
};

// Keep the actions for manual creation if needed
export const actions = {
    default: async ({ cookies }) => {
        try {
            const { account } = createAdminClient();
            const session = await account.createAnonymousSession();

            cookies.set(SESSION_COOKIE, session.secret, {
                sameSite: 'strict',
                expires: new Date(session.expire),
                secure: true,
                path: '/',
                httpOnly: true
            });
        } catch (error) {
            console.error('Anonymous session creation error:', error);
            throw error;
        }

        return redirect(302, `/app`);
    }
} satisfies Actions; 
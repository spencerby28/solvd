import { SESSION_COOKIE, createAdminClient } from '$lib/appwrite';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ID, Permission, Role, Query } from 'appwrite';
import type { Messages, HelpType } from '$lib/types';

export const load: LayoutServerLoad = async ({ cookies, params, url, locals }) => {
    const sessionCookie = cookies.get(SESSION_COOKIE);
    
    if (!sessionCookie) {
        const { account, users } = createAdminClient();
        try {
            // Create anonymous session
            const session = await account.createAnonymousSession();
            //TODO: get locale and location from ip address
            const setUserAnon = await users.updateLabels(session.userId, ['anon']);
            console.log('setUserAnon', setUserAnon);

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

    const { databases } = createAdminClient();
    const { ticketId } = params;
    const type = url.searchParams.get('type') as HelpType['type'] || 'help';

    console.log('[LayoutServer] Fetching messages for ticket:', ticketId);
    const messages = await databases.listDocuments<Messages>(
        'tickets',
        'messages',
        [
            Query.equal('ticket_id', ticketId),
            Query.orderAsc('$createdAt')
        ]
    );

    if (messages.documents.length === 0) {
        const messageId = ID.unique();
        
        let welcomeContent = "Welcome! I'm here to help with anything you need. What can I help you with today?";
        
        switch(type) {
            case 'order':
                welcomeContent = "Welcome! I'll help you track your order and provide any updates you need. Could you please share your order number?";
                break;
            case 'product':
                welcomeContent = "Welcome! I'd be happy to help you with product information. What specific product would you like to know more about?";
                break;
            case 'returns':
                welcomeContent = "Welcome! I'll guide you through our returns and exchanges process. Have you already made a purchase that you'd like to return?";
                break;
            case 'help':
                welcomeContent = "Welcome! I'm here to help with any questions or concerns you might have. What can I assist you with today?";
                break;
        }

        const welcomeMessage: Partial<Messages> = {
            ticket_id: ticketId,
            content: welcomeContent,
            sender_id: 'system',
            sender_name: 'System',
            sender_type: 'system',
            channel: 'chat',
            tenant_id: params.tenantId,
            read_status: false,
            is_welcome: true
        };

        await databases.createDocument(
            'tickets',
            'messages',
            messageId,
            welcomeMessage,
            [
                Permission.read(Role.team(params.tenantId)),
                Permission.read(Role.label('anon'))
            ]
        );

        return {
            tenantId: params.tenantId,
            ticketId,
            messages: [welcomeMessage]
        };
    }

    return {
        userId: locals.user?.$id,
        tenantId: params.tenantId,
        ticketId,
        messages: messages.documents
    };
}; 
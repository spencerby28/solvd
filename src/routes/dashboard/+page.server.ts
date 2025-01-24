import { SESSION_COOKIE, createSessionClient } from '$lib/appwrite';
import { redirect, type Actions } from '@sveltejs/kit';

// Mock data for the dashboard
const mockTicketFlow = {
    nodes: [
        // Input nodes
        { id: 0, name: 'Tickets', value: 250, height: 1 },
        
        // Category nodes with their handling nodes
        { id: 1, name: 'Returns', value: 80, height: 1 },
        { id: 2, name: 'AI', value: 180, height: 1 },
        { id: 3, name: 'Product Issues', value: 60, height: 1 },
        { id: 4, name: 'Human', value: 70, height: 1 },
        { id: 5, name: 'General Inquiry', value: 50, height: 1 },
        { id: 6, name: 'Account Issues', value: 40, height: 1 },
        { id: 7, name: 'Billing', value: 20, height: 1 },
        
        // Resolution nodes (end nodes)
        { id: 8, name: 'Resolved', value: 160, height: 0 },
        { id: 9, name: 'Escalated', value: 50, height: 0 },
        { id: 10, name: 'Pending', value: 40, height: 0 }
    ],
    links: [
        // Incoming to Categories
        { source: 0, target: 1, value: 80 },  // Incoming -> Returns
        { source: 0, target: 3, value: 60 },  // Incoming -> Product Issues
        { source: 0, target: 5, value: 50 },  // Incoming -> General Inquiry
        { source: 0, target: 6, value: 40 },  // Incoming -> Account Issues
        { source: 0, target: 7, value: 20 },  // Incoming -> Billing

        // Categories to Handling
        { source: 1, target: 2, value: 60 },  // Returns -> AI
        { source: 1, target: 4, value: 20 },  // Returns -> Human
        { source: 3, target: 2, value: 40 },  // Product Issues -> AI
        { source: 3, target: 4, value: 20 },  // Product Issues -> Human
        { source: 5, target: 2, value: 45 },  // General Inquiry -> AI
        { source: 5, target: 4, value: 5 },   // General Inquiry -> Human
        { source: 6, target: 2, value: 25 },  // Account Issues -> AI
        { source: 6, target: 4, value: 15 },  // Account Issues -> Human
        { source: 7, target: 2, value: 10 },  // Billing -> AI
        { source: 7, target: 4, value: 10 },  // Billing -> Human

        // Handling to Resolution
        { source: 2, target: 8, value: 120 }, // AI -> Resolved
        { source: 2, target: 9, value: 30 },  // AI -> Escalated
        { source: 2, target: 10, value: 30 }, // AI -> Pending
        { source: 4, target: 8, value: 40 },  // Human -> Resolved
        { source: 4, target: 9, value: 20 },  // Human -> Escalated
        { source: 4, target: 10, value: 10 }  // Human -> Pending
    ]
};

const mockTickets = [
    { id: 1, title: 'Refund for damaged product', status: 'resolved', handledBy: 'AI', priority: 'high', category: 'Returns' },
    { id: 2, title: 'Product not working as expected', status: 'pending', handledBy: 'AI', priority: 'medium', category: 'Product Issues' },
    { id: 3, title: 'How to use feature X', status: 'resolved', handledBy: 'AI', priority: 'low', category: 'General Inquiry' },
    { id: 4, title: 'Cannot access account', status: 'escalated', handledBy: 'Human', priority: 'high', category: 'Account Issues' },
    { id: 5, title: 'Double charged on subscription', status: 'resolved', handledBy: 'Human', priority: 'high', category: 'Billing' },
    { id: 6, title: 'Wrong size delivered', status: 'pending', handledBy: 'AI', priority: 'medium', category: 'Returns' },
    { id: 7, title: 'Missing parts in package', status: 'escalated', handledBy: 'AI', priority: 'high', category: 'Product Issues' },
    { id: 8, title: 'Password reset not working', status: 'resolved', handledBy: 'AI', priority: 'medium', category: 'Account Issues' }
];

export async function load({ locals }) {
    // Logged out users can't access this page
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 0));

    // Return mock data
    return {
        user: locals.user,
        ticketFlow: mockTicketFlow,
        tickets: mockTickets
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

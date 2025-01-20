import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const VERIFY_TOKEN = 'solvd'; // This should be stored securely, e.g. in env vars

export async function GET({ url }: RequestEvent) {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verify the mode and token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        return new Response(challenge, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        throw error(403, 'Forbidden');
    }
}

export async function POST({ request }: RequestEvent) {
    // Handle actual webhook events here
    const data = await request.json();
    
    // Process the webhook payload
    console.log('Received webhook:', data);
    
    // Return a 200 OK response
    return new Response('OK', { status: 200 });
}

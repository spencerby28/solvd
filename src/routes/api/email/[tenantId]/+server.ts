import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ request, url }: RequestEvent) {
	try {
		// Log all headers to debug
		const headers = Object.fromEntries(request.headers.entries());
		console.log('SNS GET Request Headers:', headers);
		
		const params = url.searchParams;
		console.log('SNS Subscription Request:', {
			params: Object.fromEntries(params.entries())
		});

		// If this is a subscription confirmation
		if (params.get('Type') === 'SubscriptionConfirmation') {
			console.log('Handling subscription confirmation');
			// Return the challenge parameter if present
			const challenge = params.get('challenge');
			if (challenge) {
				return new Response(challenge, {
					headers: { 'Content-Type': 'text/plain' }
				});
			}
		}
		
		return json({ success: true });
	} catch (error) {
		console.error('Error in GET handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function HEAD({ request }: RequestEvent) {
	try {
		const headers = Object.fromEntries(request.headers.entries());
		console.log('SNS HEAD Request Headers:', headers);
		return new Response(null, { status: 200 });
	} catch (error) {
		console.error('Error in HEAD handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST({ request }: RequestEvent) {
	try {
		const headers = Object.fromEntries(request.headers.entries());
		console.log('SNS POST Request Headers:', headers);
		
		const data = await request.json();
		console.log('Raw POST body:', data);
		
		// Parse the SNS message
		const {
			Type,
			MessageId,
			TopicArn,
			Message,
			Timestamp,
			SignatureVersion,
			Signature,
			SigningCertURL,
			UnsubscribeURL
		} = data;

		console.log('SNS Message Details:', {
			Type,
			MessageId, 
			TopicArn,
			Message: typeof Message === 'string' ? JSON.parse(Message) : Message,
			Timestamp,
			SignatureVersion,
			SigningCertURL
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error in POST handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

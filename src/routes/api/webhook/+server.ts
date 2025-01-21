import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';

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

	// Handle read receipt events
	if (data.entry?.[0]?.messaging?.[0]?.read) {
		const timestamp = new Date(data.entry[0].messaging[0].timestamp);
		console.log(`User read message at ${timestamp}`);
		return new Response('OK', { status: 200 });
	}

	// Check if this is a messaging event
	if (data.entry?.[0]?.messaging?.[0]?.message) {
		// Check if this is an echo message
		if (data.entry[0].messaging[0].message?.is_echo) {
			console.log('[Bot] sent message: ', data.entry[0].messaging[0].message);
			return new Response('OK', { status: 200 });
		}

		console.log('Received messaging event ', data.entry[0].messaging[0].message);
		const botAccountId = data.entry[0].messaging[0].recipient.id;
		const messageId = data.entry[0].messaging[0].message.mid;
		const userId = data.entry[0].messaging[0].sender.id;

		//await reactToMessage(botAccountId, messageId, userId);
	await sendMessage(botAccountId, userId, 'Hello, how can I help you today?', [
			{ title: 'Get Started', payload: 'GET_STARTED' },
			{ title: 'Pricing Info', payload: 'PRICING_INFO' },
			{ title: 'Contact Support', payload: 'CONTACT_SUPPORT' },
			{ title: 'Features', payload: 'FEATURES_INFO' }
		]);
	}
        /*	
        await sendButtonMessage(botAccountId, userId, 'Hello, how can I help you today?', {
            title: 'Get Started',
            payload: 'GET_STARTED'
		});
        
	}
*/
	// Return a 200 OK response
	return new Response('OK', { status: 200 });
}

async function reactToMessage(botAccountId: string, messageId: string, userId: string) {
	const { databases } = createAdminClient();

	const instagramIntegration = await databases.getDocument(
		'integrations',
		'instagram',
		botAccountId
	);
	//console.log('[Instagram integration]', instagramIntegration);

	console.log('Attempting to react to message', messageId, 'for user', userId);

	const response = await fetch(`https://graph.instagram.com/v21.0/${botAccountId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${instagramIntegration.access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			recipient: {
				id: userId
			},
			sender_action: 'react',
			payload: {
				message_id: messageId,
				reaction: 'love'
			}
		})
	});

	if (!response.ok) {
		console.error('Failed to send reaction:', await response.text());
		return false;
	}

	return true;
}

async function sendMessage(
	botAccountId: string,
	userId: string,
	message: string,
	quickReplies?: Array<{ title: string; payload: string }>
) {
	const { databases } = createAdminClient();

	const instagramIntegration = await databases.getDocument(
		'integrations',
		'instagram',
		botAccountId
	);
	//  console.log('[Instagram integration]', instagramIntegration);

	const messageBody: any = {
		recipient: {
			id: userId
		},
		messaging_type: 'RESPONSE',
		message: {
			text: message
		}
	};

	if (quickReplies) {
		messageBody.message.quick_replies = quickReplies.map((reply) => ({
			content_type: 'text',
			title: reply.title,
			payload: reply.payload
		}));
	}

	const response = await fetch(`https://graph.instagram.com/v21.0/${botAccountId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${instagramIntegration.access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(messageBody)
	});

	if (!response.ok) {
		console.error('Failed to send message:', await response.text());
		return false;
	}

	return true;
}

async function sendButtonMessage(
	botAccountId: string,
	userId: string,
	message: string,
	button: { title: string; payload: string }
) {
	const { databases } = createAdminClient();

	const instagramIntegration = await databases.getDocument(
		'integrations',
		'instagram',
		botAccountId
	);

	const messageBody = {
		recipient: {
			id: userId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'button',
					text: message,
					buttons: [
						{
							type: 'postback',
							title: button.title,
							payload: button.payload
						}
					]
				}
			}
		}
	};

	const response = await fetch(`https://graph.instagram.com/v21.0/${botAccountId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${instagramIntegration.access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(messageBody)
	});

	if (!response.ok) {
		console.error('Failed to send button message:', await response.text());
		return false;
	}

	return true;
}

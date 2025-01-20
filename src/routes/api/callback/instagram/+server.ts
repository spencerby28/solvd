import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI } from '$env/static/private';
import { createAdminClient, ID, type AppwriteException } from '$lib/appwrite';

export const GET: RequestHandler = async ({ url, request, locals }) => {
	// Get the current user ID from locals
	if (!locals.user) {
		throw error(401, {
			message: 'User must be logged in'
		});
	}
	const appwriteUserId = locals.user.$id;
	const teamId = locals.user.prefs.team_id;

	// Check for error parameters indicating canceled authorization
	const errorParam = url.searchParams.get('error');
	if (errorParam === 'access_denied') {
		throw error(400, {
			message: 'Instagram authorization was denied'
		});
	}

	// Handle both URL code param and request body
	const code = url.searchParams.get('code');
	let finalData;

	if (code) {
		// Strip out #_ if present at the end
		const cleanCode = code.replace(/#_$/, '');

		// Exchange code for access token
		const formData = new FormData();
		formData.append('client_id', INSTAGRAM_APP_ID);
		formData.append('client_secret', INSTAGRAM_APP_SECRET); 
		formData.append('grant_type', 'authorization_code');
		formData.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
		formData.append('code', cleanCode);

		const shortLivedTokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
			method: 'POST',
			body: formData
		});

		if (!shortLivedTokenResponse.ok) {
			throw error(500, {
				message: 'Failed to exchange code for access token'
			});
		}

		const shortLivedData = await shortLivedTokenResponse.json();
		console.log('[Short-lived token response]', shortLivedData);

		const longLivedTokenResponse = await fetch(
			`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${shortLivedData.access_token}`,
			{
				method: 'GET'
			}
		);

		if (!longLivedTokenResponse.ok) {
			throw error(500, {
				message: 'Failed to exchange for long-lived token'
			});
		}

		const longLivedTokenData = await longLivedTokenResponse.json();
		console.log('[Long-lived token response]', longLivedTokenData);

		finalData = {
			user_id: shortLivedData.user_id,
			access_token: longLivedTokenData.access_token,
			expires_at: new Date(Date.now() + (longLivedTokenData.expires_in * 1000)) // expires_in is in seconds, so multiply by 1000 for milliseconds
		};
	} else {
		// Try to get data from request body for second request
		try {
			finalData = await request.json();
		} catch (e) {
			throw error(400, {
				message: 'No authorization code or valid request body received'
			});
		}
	}

	const { databases } = createAdminClient();

	let instagramIntegration;
	try {
		instagramIntegration = await databases.createDocument(
			'integrations',
			'instagram', 
			ID.unique(),
			{
				user_id: appwriteUserId,
				team_id: teamId,
				instagram_user_id: finalData.user_id.toString(),
				access_token: finalData.access_token,
				expires: finalData.expires_at
			}
		);
	} catch (e) {
		throw error(500, {
			message: 'Failed to create Instagram integration document'
		});
	}

	console.log('[Instagram integration]', instagramIntegration);

	throw redirect(303, '/connect/success?provider=Instagram');
};

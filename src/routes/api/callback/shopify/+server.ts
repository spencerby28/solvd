import { error } from '@sveltejs/kit';
import { SHOPIFY_CLIENT_SECRET, SHOPIFY_CLIENT_ID } from '$env/static/private';


/*
THINGS TO NOTE: 

If we are doing a private install, then we need to use separate client IDs from the db shopift-store under integrations, shopify-stores
However the default will be to try and use the public app 
Depening on how difficult it is to actually go public


*/

export const GET = async ({ url, cookies }) => {
  console.log('Received Shopify callback');

  try {
    // Get query parameters
    const code = url.searchParams.get('code');
    const shop = url.searchParams.get('shop');
    const state = url.searchParams.get('state');
    const storedNonce = cookies.get('shopify_nonce');

    // Validate required parameters
    if (!code || !shop || !state) {
      throw new Error('Missing required parameters');
    }

    // Verify state matches stored nonce
    if (state !== storedNonce) {
      throw new Error('State validation failed');
    }

    // Exchange authorization code for access token using query parameters
    const tokenUrl = new URL(`https://${shop}/admin/oauth/access_token`);
    tokenUrl.searchParams.append('client_id', SHOPIFY_CLIENT_ID);
    tokenUrl.searchParams.append('client_secret', SHOPIFY_CLIENT_SECRET);
    tokenUrl.searchParams.append('code', code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'POST'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain access token');
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully');
    console.log(tokenData);

    // Clear nonce cookie
    const clearCookie = [
      'shopify_nonce=',
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Max-Age=0'
    ].join('; ');

    // Redirect to app home with success
    return new Response(null, {
      status: 307,
      headers: {
        'Location': '/',
        'Set-Cookie': clearCookie
      }
    });

  } catch (err) {
    console.error('Error processing callback:', err);
    throw error(400, {
      message: err instanceof Error ? err.message : 'Invalid request'
    });
  }
};


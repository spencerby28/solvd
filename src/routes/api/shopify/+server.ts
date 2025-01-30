import { error } from '@sveltejs/kit';
import crypto from 'crypto';
import { SHOPIFY_CLIENT_SECRET, SHOPIFY_CLIENT_ID } from '$env/static/private';

export const GET = async ({ url }) => {
  console.log('Received Shopify installation request');
  
  try {
    // Get all query parameters
    const queryParams = url.searchParams;
    const hmac = queryParams.get('hmac');
    const shop = queryParams.get('shop');
    
    console.log('Original query parameters:', Object.fromEntries(queryParams));

    if (!hmac) {
      throw new Error('HMAC parameter is missing');
    }

    if (!shop) {
      throw new Error('Shop parameter is missing');
    }

    // Remove hmac and create new query string
    queryParams.delete('hmac');
    
    // Sort remaining params alphabetically and create message string
    const message = Array.from(queryParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    console.log('Message to verify:', message);

    // Generate HMAC hash
    const generated_hash = crypto
      .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
      .update(message)
      .digest('hex');

    console.log('Generated hash:', generated_hash);
    console.log('Received hmac:', hmac);

    // Verify HMAC
    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(generated_hash, 'hex'),
      Buffer.from(hmac, 'hex')
    );

    if (!hashesMatch) {
      console.log('HMAC verification failed');
      throw new Error('HMAC validation failed - request could not be verified');
    }

    console.log('HMAC verification successful');

    // Generate nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Build redirect URL
    const redirectUri = 'https://app.getsolvd.xyz/api/callback/shopify'; // Update this with your actual redirect URI
    const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.append('client_id', SHOPIFY_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', nonce);

    // Create signed cookie with nonce
    const cookieOptions = [
      `shopify_nonce=${nonce}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax'
    ].join('; ');

    return new Response(null, {
      status: 307,
      headers: {
        'Location': authUrl.toString(),
        'Set-Cookie': cookieOptions
      }
    });

  } catch (err) {
    console.error('Error processing request:', err);
    throw error(400, {
      message: err instanceof Error ? err.message : 'Invalid request'
    });
  }
};

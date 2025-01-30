import { error } from '@sveltejs/kit';
import crypto from 'crypto';
import { SHOPIFY_CLIENT_SECRET } from '$env/static/private';

export const POST = async ({ request }) => {
  try {
    // Get the HMAC header
    const hmac = request.headers.get('HTTP_X_SHOPIFY_HMAC_SHA256');
    
    if (!hmac) {
      throw new Error('HMAC header is missing');
    }

    // Get raw body as text for HMAC verification
    const rawBody = await request.text();
    
    // Generate HMAC hash
    const generated_hash = crypto
      .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
      .update(rawBody)
      .digest('base64');

    console.log('Generated hash:', generated_hash);
    console.log('Received hmac:', hmac);

    // Verify HMAC
    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(generated_hash),
      Buffer.from(hmac)
    );

    if (!hashesMatch) {
      console.log('HMAC verification failed');
      throw new Error('HMAC validation failed - request could not be verified');
    }

    console.log('HMAC verification successful');

    // Parse and log the request body
    const data = JSON.parse(rawBody);
    console.log('Received compliance webhook data:', data);

    // Return 200 OK response
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Error processing compliance webhook:', err);
    throw error(400, {
      message: err instanceof Error ? err.message : 'Invalid request'
    });
  }
};

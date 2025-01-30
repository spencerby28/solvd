import { error } from '@sveltejs/kit';

export const POST = async ({ request }) => {
  try {
    // Parse and log the request body
    const data = await request.json();
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

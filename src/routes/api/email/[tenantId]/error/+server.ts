import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
	try {
		const headers = Object.fromEntries(request.headers.entries());
		console.log('Email Error POST Request Headers:', headers);

		const data = await request.json();
		console.log('Email Error POST body:', data);

		return json({ success: true });
	} catch (error) {
		console.error('Error in POST handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

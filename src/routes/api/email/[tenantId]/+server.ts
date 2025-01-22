import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request, fetch, params }: RequestEvent) {
	try {
		const headers = Object.fromEntries(request.headers.entries());
		console.log('Email POST Request Headers:', headers);

		const data = await request.json();
		console.log('Email POST body:', {
			from: data.from,
			to: data.to,
			subject: data.subject,
			messageId: data.messageId,
			date: data.date,
			body: data.body
		});

		const response = await fetch(`/api/web/tickets/create?tenant=${params.tenantId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const result = await response.json();
		return json(result);

	} catch (error) {
		console.error('Error in POST handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

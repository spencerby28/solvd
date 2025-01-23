import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

interface EmailData {
	from: string;
	to: string;
	subject: string;
	messageId: string;
	date: string;
	body: string;
}

function parseTicketInfo(to: string): { ticketId: string; tenantId: string } | null {
	// Extract from format: Sample Team Customer Support <6791c0330000874af604-sample_team@getsolvd.xyz>
	console.log('[parseTicketInfo] Parsing email to:', to);
	const match = to.match(/<([^@]+)-([^@]+)@getsolvd\.xyz>/);
	console.log('[parseTicketInfo] Regex match result:', match);
	if (!match) return null;
	const [, ticketId, tenantId] = match;
	return { ticketId, tenantId };
}

export async function POST({ request, fetch, params }: RequestEvent) {
	try {
		const data: EmailData = await request.json();
		console.log('[api/email/[tenantId]] POST request received with data:', {
			to: data.to,
			from: data.from,
			subject: data.subject,
			messageId: data.messageId
		});

		// Check if this is a reply to an existing ticket
		const ticketInfo = parseTicketInfo(data.to);
		console.log('[api/email/[tenantId]] ticketInfo:', ticketInfo);
		console.log('[api/email/[tenantId]] params.tenantId:', params.tenantId);
		console.log('[api/email/[tenantId]] Checking if condition:', {
			hasTicketInfo: !!ticketInfo,
			tenantIdMatch: ticketInfo?.tenantId === params.tenantId
		});
		
		if (ticketInfo) {
			// This is a reply to an existing ticket
			if (ticketInfo.tenantId !== params.tenantId) {
				return json({ error: 'Invalid tenant ID in email address' }, { status: 400 });
			}

			console.log('[api/email/[tenantId]] attempting to forward to incoming message handler');

			// Forward to incoming message handler
			const response = await fetch(`/api/web/message/${params.tenantId}/incoming`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					ticketId: ticketInfo.ticketId,
					content: data.body,
					senderId: data.from,  // Using email address as sender ID
					senderName: data.from.split('<')[0].trim() || data.from  // Extract name part or use full email
				})
			});

			if (!response.ok) {
				console.error('Failed to forward to incoming message handler:', await response.text());
				return json({ error: 'Failed to process incoming message' }, { status: 500 });
			}

			return response;
		} else {
			// This is a new ticket - forward to ticket creation endpoint
			const response = await fetch(`/api/web/tickets/email/create?tenant=${params.tenantId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			return response;
		}
	} catch (error) {
		console.error('Error in POST handler:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

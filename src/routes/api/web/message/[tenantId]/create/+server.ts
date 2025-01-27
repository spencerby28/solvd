import { json } from '@sveltejs/kit';
import { ID, Permission, Role, Query } from 'node-appwrite';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, CreateMessagePayload } from '$lib/types';

export async function POST({ request, params, fetch }) {
	console.log('Received message creation request');
	const messageData: CreateMessagePayload = await request.json();
	const tenant_id = params.tenantId;

	console.log('Message data:', messageData);
	console.log('Tenant ID:', tenant_id);

	if (!tenant_id || !messageData.ticket_id) {
		console.error('Missing required fields:', { tenant_id, ticket_id: messageData.ticket_id });
		return json({ success: false, error: 'Missing required fields' }, { status: 400 });
	}

	const { databases } = createAdminClient();
	console.log('Created admin client');

	try {
		const messageId = ID.unique();
		console.log('Generated message ID:', messageId);
		// Create the full message document from the payload
		const { customer_id, ...messageDataWithoutCustomerId } = messageData;
		const message = await databases.createDocument(
			'tickets',
			'messages',
			messageId,
			{
				...messageDataWithoutCustomerId,
				tenant_id,
				$createdAt: new Date().toISOString()
			},
			[
				Permission.write(Role.team(tenant_id)),
				Permission.read(Role.team(tenant_id)),
				Permission.read(Role.user(customer_id))
			]
		);

		//TODO: with attachments, can we render those inline in the email?
		if (messageData.channel === 'email' && !messageData.internal) {
			// Get all messages for this ticket
			const messages = await databases.listDocuments('tickets', 'messages', [
				Query.limit(100),
				Query.equal('ticket_id', messageData.ticket_id),
			//	Query.notEqual('internal', true)
			]);
			
			const finalMessages = messages.documents.filter(doc => !doc.internal);
			console.log(finalMessages);
			// If channel is email, also send email

			try {
				const emailResponse = await fetch(`/api/email/${tenant_id}/create`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						ticketId: messageData.ticket_id,
						messages: finalMessages,
						recipient: messageData.email,
						subject: messageData.subject,
						tenantId: tenant_id
					})
				});

				if (!emailResponse.ok) {
					console.error('Failed to send email:', await emailResponse.text());
				}
			} catch (emailError) {
				console.error('Error sending email:', emailError);
				// Continue execution even if email fails
			}
		}

		return json({ success: true, message });
	} catch (error) {
		console.error('Error creating message:', error);
		return json({ success: false, error: 'Failed to create message' }, { status: 500 });
	}
}

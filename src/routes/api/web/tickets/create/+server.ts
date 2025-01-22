import { ID, Permission, Role, Query } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, Tickets, Customers } from '$lib/types';
import type { Databases } from 'node-appwrite';

interface CustomerCreateParams {
	name: string;
	email: string;
	tenant: string;
}

interface TicketCreateParams {
	ticketId: string;
	customerId: string;
	messageId: string;
	senderName: string;
	subject: string;
	date: string;
	tenant: string;
	emailThreadId: string;
}

interface MessageCreateParams {
	messageId: string;
	customerId: string;
	senderName: string;
	body: string;
	ticketId: string;
	tenant: string;
	emailMessageId: string;
}

async function findCustomerByEmailAndTenant(databases: Databases, email: string, tenant: string): Promise<Customers | null> {
	try {
		const response = await databases.listDocuments('tickets', 'customers', [
			Query.equal('email', email),
			Query.equal('tenant_id', tenant)
		]);
		return response.documents[0] as Customers || null;
	} catch (error) {
		console.error('Error finding customer:', error);
		return null;
	}
}

async function createCustomer(
	databases: Databases,
	{ name, email, tenant }: CustomerCreateParams,
	ticketId: string
): Promise<string> {
	const customerId = ID.unique();
	await databases.createDocument(
		'tickets',
		'customers',
		customerId,
		{
			name,
			email,
			locale: 'en-US',
			timezone: 'UTC',
			instagram_id: null,
			instagram_username: null,
			shopify_id: null,
			tickets: [ticketId],
			status: 'active',
			tenant_id: tenant
		},
		[
			Permission.read(Role.team(tenant)),
			Permission.update(Role.team(tenant)),
			Permission.write(Role.team(tenant, 'admin'))
		]
	);
	return customerId;
}

async function createTicket(
	databases: Databases,
	params: TicketCreateParams
): Promise<Tickets> {
	return databases.createDocument(
		'tickets',
		'tickets',
		params.ticketId,
		{
			customer_id: params.customerId,
			channel: 'email',
			category: 'support',
			last_active: params.date,
			messages: [params.messageId],
			customer_name: params.senderName,
			customer_last_seen: params.date,
			customer_locale: 'en-US',
			customer_timezone: 'UTC',
			assigned_to: null,
			assigned_name: null,
			subject: params.subject,
			internal_messages: [],
			tenant_id: params.tenant,
			priority: 'medium',
			status: 'new',
			email_thread_id: params.emailThreadId
		},
		[
			Permission.read(Role.team(params.tenant)),
			Permission.update(Role.team(params.tenant)),
			Permission.write(Role.team(params.tenant, 'admin'))
		]
	) as Promise<Tickets>;
}

async function createMessage(
	databases: Databases,
	params: MessageCreateParams
): Promise<Messages> {
	return databases.createDocument(
		'tickets',
		'messages',
		params.messageId,
		{
			content: params.body,
			sender_id: params.customerId,
			sender_name: params.senderName,
			sender_type: 'customer',
			source: 'email',
			attachments: [],
			read_status: false,
			edited: false,
			ticket_id: params.ticketId,
			tenant_id: params.tenant,
			email_message_id: params.emailMessageId
		},
		[
			Permission.read(Role.team(params.tenant)),
			Permission.update(Role.team(params.tenant)),
			Permission.write(Role.team(params.tenant, 'admin'))
		]
	) as Promise<Messages>;
}

async function appendMessageToTicket(
	databases: Databases,
	ticketId: string,
	messageId: string,
	customerId: string,
	senderName: string,
	body: string,
	tenant: string,
	emailMessageId: string
): Promise<void> {
	const ticket = await databases.getDocument('tickets', 'tickets', ticketId) as Tickets;

	// Create new message
	await createMessage(databases, {
		messageId,
		customerId,
		senderName,
		body,
		ticketId,
		tenant,
		emailMessageId
	});

	// Update ticket's messages array
	await databases.updateDocument('tickets', 'tickets', ticketId, {
		messages: [...(ticket.messages || []), messageId],
		last_active: new Date().toISOString()
	});
}

export async function POST({ request, url }) {
	const tenant = url.searchParams.get('tenant');
	if (!tenant) {
		return json({ success: false, error: 'Tenant is required' }, { status: 400 });
	}

	const emailData = await request.json();
	const { from, to, subject, messageId, date, body } = emailData;

	// Parse sender name and email from "From" field
	const fromMatch = from.match(/(.*?)\s*<(.+?)>/);
	const senderName = fromMatch ? fromMatch[1].trim() : from;
	const senderEmail = fromMatch ? fromMatch[2] : from;

	const { databases } = createAdminClient();

	try {
		// Check if this is a reply to an existing ticket
		const toMatch = to.match(/([^@]+)-([^@]+)@getsolvd\.xyz/);

		if (toMatch) {
			// This is a reply to an existing ticket
			const [, ticketId, ticketTenant] = toMatch;

			if (ticketTenant !== tenant) {
				return json(
					{ success: false, error: 'Invalid tenant ID in email address' },
					{ status: 400 }
				);
			}

			// Find the customer
			const customer = await findCustomerByEmailAndTenant(databases, senderEmail, tenant);
			if (!customer) {
				return json({ success: false, error: 'Customer not found' }, { status: 400 });
			}

			// Append message to existing ticket
			const newMessageId = ID.unique();
			await appendMessageToTicket(
				databases,
				ticketId,
				newMessageId,
				customer.$id,
				senderName,
				body,
				tenant,
				messageId
			);

			return json({ success: true });
		} else {
			// This is a new ticket
			// First check if customer exists
			let customer = await findCustomerByEmailAndTenant(databases, senderEmail, tenant);
			const ticketId = ID.unique();
			const messageId_db = ID.unique();

			// If customer doesn't exist, we'll create them
			const customerId = customer
				? customer.$id
				: await createCustomer(
						databases,
						{ name: senderName, email: senderEmail, tenant },
						ticketId
					);

			// Create ticket and message in parallel
			await Promise.all([
				createTicket(databases, {
					ticketId,
					customerId,
					messageId: messageId_db,
					senderName,
					subject,
					date,
					tenant,
					emailThreadId: messageId
				}),
				createMessage(databases, {
					messageId: messageId_db,
					customerId,
					senderName,
					body,
					ticketId,
					tenant,
					emailMessageId: messageId
				})
			]);

			return json({ success: true });
		}
	} catch (error) {
		console.error('Error handling email:', error);
		return json({ success: false, error: 'Failed to process email' }, { status: 500 });
	}
}

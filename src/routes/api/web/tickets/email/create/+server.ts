import { ID, Permission, Role, Query } from 'node-appwrite';
import { json } from '@sveltejs/kit';
import { createAdminClient } from '$lib/appwrite';
import type { Messages, Tickets, Customers } from '$lib/types';
import type { Databases } from 'node-appwrite';

interface EmailData {
	from: string;
	to: string;
	subject: string;
	messageId: string;
	date: string;
	body: string;
}

interface ParsedEmailAddress {
	name: string;
	email: string;
}

function parseEmailAddress(emailStr: string): ParsedEmailAddress {
	const match = emailStr.match(/(.*?)\s*<(.+?)>/);
	return {
		name: match ? match[1].trim() : emailStr,
		email: match ? match[2] : emailStr
	};
}

function cleanEmailBody(body: string): string {
	// Remove email client quoted content
	const lines = body.split('\n');
	const cleanedLines = [];
	
	for (const line of lines) {
		// Stop at common email client quote markers
		if (line.match(/^>|On .* wrote:|Begin forwarded message/)) {
			break;
		}
		cleanedLines.push(line);
	}
	
	return cleanedLines.join('\n').trim();
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
	{ name, email, tenant }: { name: string; email: string; tenant: string },
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
	params: {
		ticketId: string;
		customerId: string;
		messageId: string;
		senderName: string;
		subject: string;
		date: string;
		tenant: string;
		emailThreadId: string;
		customerEmail: string;
	}
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
			email_thread_id: params.emailThreadId,
			customer_email: params.customerEmail
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
	params: {
		messageId: string;
		customerId: string;
		senderName: string;
		body: string;
		ticketId: string;
		tenant: string;
		emailMessageId: string;
	}
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
			channel: 'email',
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

export async function POST({ request, url }) {
	const tenant = url.searchParams.get('tenant');
	if (!tenant) {
		return json({ success: false, error: 'Tenant is required' }, { status: 400 });
	}

	const emailData: EmailData = await request.json();
	const senderInfo = parseEmailAddress(emailData.from);
	const databases = createAdminClient().databases;

	try {
		const ticketId = ID.unique();
		const messageId = ID.unique();

		// Find or create customer
		let customer = await findCustomerByEmailAndTenant(databases, senderInfo.email, tenant);
		const customerId = customer
			? customer.$id
			: await createCustomer(
				databases,
				{ name: senderInfo.name, email: senderInfo.email, tenant },
				ticketId
			);

		// Create ticket and initial message in parallel
		await Promise.all([
			createTicket(databases, {
				ticketId,
				customerId,
				messageId,
				senderName: senderInfo.name,
				subject: emailData.subject,
				date: emailData.date,
				tenant,
				emailThreadId: emailData.messageId,
				customerEmail: senderInfo.email
			}),
			createMessage(databases, {
				messageId,
				customerId,
				senderName: senderInfo.name,
				body: cleanEmailBody(emailData.body),
				ticketId,
				tenant,
				emailMessageId: emailData.messageId
			})
		]);

		return json({ success: true, ticketId });
	} catch (error) {
		console.error('Error creating ticket:', error);
		return json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
	}
}

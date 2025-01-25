import { renderEmail } from '$lib/utils/render';
import Hello from '$lib/emails/Hello.svelte';
import AWS from 'aws-sdk';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	AWS.config.update({
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
		region: AWS_REGION
	});

	console.log('Creating SES client...');
	const ses = new AWS.SES();

	// Get ticket data from request
	const { ticketId, messages, recipient, subject, tenantId } = await request.json();
	console.log(ticketId, messages, recipient, subject, tenantId);

	// Generate tenant name from tenantId
	let tenantName = tenantId;
	if (tenantId.includes('_')) {
		// Convert underscore to space and capitalize each word
		tenantName = tenantId
			.split('_')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	console.log('Rendering email template...');
	//@ts-ignore
	const { html, text } = await renderEmail(Hello, { messages, ticketId, ticketSubject: subject, tenantId, tenantName });

	
	const RECIPIENT = recipient;
	const SENDER = `${tenantName} Customer Support <${tenantId}@getsolvd.xyz>`;
	const TICKET_SPECIFIC_ADDRESS = `${tenantName} Customer Support <${ticketId}-${tenantId}@getsolvd.xyz>`;
	const SUBJECT = "Re: " + subject;
	const CHARSET = "UTF-8";

	console.log('Sending email...');
	try {
		const response = await ses.sendEmail({
			Destination: {
				ToAddresses: [RECIPIENT]
			},
			Message: {
				Body: {
					Html: {
						Charset: CHARSET,
						Data: html
					},
					Text: {
						Charset: CHARSET, 
						Data: text
					}
				},
				Subject: {
					Charset: CHARSET,
					Data: SUBJECT
				}
			},
			Source: SENDER,
			ReplyToAddresses: [TICKET_SPECIFIC_ADDRESS]
		}).promise();

		console.log('Email sent successfully:', response.MessageId);
		return json({ success: true, messageId: response.MessageId }, { status: 200 });
	} catch (error) {
		console.error('Failed to send email:', error);
		return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
	}
}

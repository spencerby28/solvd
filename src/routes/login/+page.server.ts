import { SESSION_COOKIE, createAdminClient } from '$lib/appwrite';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, cookies }) => {
		console.log('Login attempt started');
		
		// Extract the form data
		const form = await request.formData();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();
		console.log('Form data received - Email:', email);

		try {
			// Validate inputs
			if (!email || !password) {
				console.log('Validation failed: Missing email or password');
				return fail(400, {
					error: 'Email and password are required',
					email: email || ''
				});
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				console.log('Validation failed: Invalid email format');
				return fail(400, {
					error: 'Invalid email format',
					email: email
				});
			}
			console.log('Input validation passed');
		} catch (error: any) {
			console.error('Validation error:', error);
			return fail(400, {
				error: 'Validation failed',
				email: email || ''
			});
		}

		try {
			console.log('Attempting to create Appwrite client');
			// Create the Appwrite client
			const { account } = createAdminClient();

			console.log('Attempting to create email/password session');
			// Create the session using the client
			const session = await account.createEmailPasswordSession(email, password);
			console.log('Session created successfully');

			// Set the session cookie with the secret
			cookies.set(SESSION_COOKIE, session.secret, {
				sameSite: 'strict',
				expires: new Date(session.expire),
				secure: true,
				path: '/',
				httpOnly: true
			});
			console.log('Session cookie set');
		} catch (error) {
			console.error('Login error:', error);
			return fail(400, {
				error: 'Invalid email or password',
				email: email
			});
		}

		console.log('Login successful, redirecting to dashboard');
		// Redirect to the dashboard after successful login
		return redirect(302, `/app`);
	}
} satisfies Actions;

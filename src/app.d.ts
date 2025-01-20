// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Models } from 'node-appwrite';

declare global {
	namespace App {
		interface Locals {
			user?: Models.User<Models.Preferences>;
			sessionId?: string;
		}
	}
}

export {};

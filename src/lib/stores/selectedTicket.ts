import { writable } from 'svelte/store';
import type { Tickets } from '$lib/types';

export const selectedTicket = writable<Tickets | null>(null);

import { writable } from 'svelte/store';
import type { Messages } from '$lib/types';

export const internalMessages = writable<Messages[]>([]);

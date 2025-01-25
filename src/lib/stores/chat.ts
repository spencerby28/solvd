import { writable } from 'svelte/store';
import type { Client, Databases, Models, RealtimeResponseEvent } from 'appwrite';
import type { Messages } from '$lib/types';

export type ChatMessage = Messages;
export type ChatSession = ChatMessage[];

function createChatStore() {
    const { subscribe, set, update } = writable<ChatSession>([]);
    let messageIds = new Set<string>();

    const addMessageIfNew = (message: ChatMessage) => {
        if (!messageIds.has(message.$id)) {
            console.log('[ChatStore] Adding new message:', message.$id);
            messageIds.add(message.$id);
            update(messages => [...messages, message]);
        } else {
            console.log('[ChatStore] Skipping duplicate message:', message.$id);
        }
    };

    return {
        subscribe,
        set: (messages: ChatSession) => {
            console.log('[ChatStore] Setting messages:', messages);
            messageIds = new Set(messages.map(m => m.$id));
            set(messages);
        },
        addMessage: (message: ChatMessage) => {
            console.log('[ChatStore] Adding message:', message);
            addMessageIfNew(message);
        },
        clearSession: () => {
            console.log('[ChatStore] Clearing session');
            messageIds.clear();
            set([]);
        },
        // Initialize with server data and setup realtime
        initialize: (client: Client, databases: Databases, initialMessages: ChatMessage[] = []) => {
            console.log('[ChatStore] Initializing with messages:', initialMessages);
            // Initialize with provided messages if any
            if (initialMessages.length > 0) {
                console.log('[ChatStore] Setting initial messages');
                set(initialMessages);
            }

            // Subscribe to realtime updates for chat messages
            console.log('[ChatStore] Setting up realtime subscription');
            const unsubscribe = client.subscribe(
                'databases.tickets.collections.messages.documents',
                (response: RealtimeResponseEvent<ChatMessage>) => {
                    const { events, payload } = response;
                    console.log('[ChatStore] Realtime event received:', events, payload);
                    
                    if (events.some((e: string) => e.includes('.create'))) {
                        console.log('[ChatStore] Adding message from realtime:', payload);
                        addMessageIfNew(payload);
                    }
                    
                    if (events.some((e: string) => e.includes('.update'))) {
                        console.log('[ChatStore] Updating message from realtime:', payload);
                        update(messages => messages.map(msg => 
                            msg.$id === payload.$id ? payload : msg
                        ));
                    }
                }
            );

            return unsubscribe;
        }
    };
}

export const chatSession = createChatStore();

import { writable } from 'svelte/store';
import type { Client, Databases, Models, RealtimeResponseEvent } from 'appwrite';
import type { Messages } from '$lib/types';

export type MessageDocument = Messages;
export type MessagesByTicket = Record<string, MessageDocument[]>;

function createMessagesStore() {
    const { subscribe, set, update } = writable<MessagesByTicket>({});

    return {
        subscribe,
        set,
        upsert: (message: MessageDocument) => {
            update(messages => {
                const ticketMessages = messages[message.ticket_id] || [];
                const index = ticketMessages.findIndex(m => m.$id === message.$id);
                
                if (index >= 0) {
                    ticketMessages[index] = message;
                } else {
                    ticketMessages.push(message);
                }
                
                return {
                    ...messages,
                    [message.ticket_id]: ticketMessages
                };
            });
        },
        remove: (messageId: string, ticketId: string) => {
            update(messages => {
                const ticketMessages = messages[ticketId] || [];
                return {
                    ...messages,
                    [ticketId]: ticketMessages.filter(m => m.$id !== messageId)
                };
            });
        },
        // Initialize with server data and setup realtime
        initialize: (client: Client, databases: Databases, initialMessages: MessageDocument[]) => {
            // Only initialize with server data if store is empty
            update(currentMessages => {
                if (Object.keys(currentMessages).length === 0) {
                    // Group initial messages by ticket_id
                    const messagesByTicket = initialMessages.reduce((acc, msg) => {
                        if (!acc[msg.ticket_id]) {
                            acc[msg.ticket_id] = [];
                        }
                        acc[msg.ticket_id].push(msg);
                        return acc;
                    }, {} as MessagesByTicket);
                    return messagesByTicket;
                }
                return currentMessages;
            });

            // Subscribe to realtime updates
            const unsubscribe = client.subscribe(
                'databases.tickets.collections.messages.documents',
                (response: RealtimeResponseEvent<MessageDocument>) => {
                    const { events, payload } = response;
                    
                    if (events.some((e: string) => e.includes('.create') || e.includes('.update'))) {
                        update(messages => {
                            const ticketMessages = messages[payload.ticket_id] || [];
                            const index = ticketMessages.findIndex(m => m.$id === payload.$id);
                            
                            if (index >= 0) {
                                ticketMessages[index] = payload;
                            } else {
                                ticketMessages.push(payload);
                            }
                            
                            return {
                                ...messages,
                                [payload.ticket_id]: ticketMessages
                            };
                        });
                    } else if (events.some((e: string) => e.includes('.delete'))) {
                        update(messages => {
                            const ticketMessages = messages[payload.ticket_id] || [];
                            return {
                                ...messages,
                                [payload.ticket_id]: ticketMessages.filter(m => m.$id !== payload.$id)
                            };
                        });
                    }
                }
            );

            return unsubscribe;
        }
    };
}

export const messages = createMessagesStore();

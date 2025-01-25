import { writable } from 'svelte/store';
import type { Client, Databases, Models, RealtimeResponseEvent } from 'appwrite';
import type { Messages } from '$lib/types';

export type MessageDocument = Messages;
export type MessagesByTicket = Record<string, MessageDocument[]>;

function createMessagesStore() {
    console.log('Creating messages store');
    const { subscribe, set, update } = writable<MessagesByTicket>({});

    return {
        subscribe,
        set,
        upsert: (message: MessageDocument) => {
     //       console.log('Upserting message:', message);
            update(messages => {
                const ticketMessages = messages[message.ticket_id] || [];
                const index = ticketMessages.findIndex(m => m.$id === message.$id);
                
                if (index >= 0) {
                    console.log('Updating existing message at index:', index);
                    ticketMessages[index] = message;
                } else {
                    console.log('Adding new message');
                    ticketMessages.push(message);
                }
                
                return {
                    ...messages,
                    [message.ticket_id]: ticketMessages
                };
            });
        },
        remove: (messageId: string, ticketId: string) => {
            console.log('Removing message:', { messageId, ticketId });
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
            console.log('Initializing messages store with', initialMessages.length, 'messages');
            // Only initialize with server data if store is empty
            update(currentMessages => {
                if (Object.keys(currentMessages).length === 0) {
                    console.log('Store empty, initializing with server data');
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
                console.log('Store already initialized, skipping');
                return currentMessages;
            });

            // Subscribe to realtime updates
            console.log('Setting up realtime subscription');
            const unsubscribe = client.subscribe(
                'databases.tickets.collections.messages.documents',
                (response: RealtimeResponseEvent<MessageDocument>) => {
                    console.log('Received realtime event:', response.events);
                    const { events, payload } = response;
                    
                    if (events.some((e: string) => e.includes('.create') || e.includes('.update'))) {
                        console.log('Processing create/update event for message:', payload.$id);
                        update(messages => {
                            const ticketMessages = messages[payload.ticket_id] || [];
                            const index = ticketMessages.findIndex(m => m.$id === payload.$id);
                            
                            if (index >= 0) {
                                console.log('Updating existing message');
                                ticketMessages[index] = payload;
                            } else {
                                console.log('Adding new message');
                                ticketMessages.push(payload);
                            }
                            
                            return {
                                ...messages,
                                [payload.ticket_id]: ticketMessages
                            };
                        });
                    } else if (events.some((e: string) => e.includes('.delete'))) {
                        console.log('Processing delete event for message:', payload.$id);
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

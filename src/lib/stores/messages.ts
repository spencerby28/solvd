import { writable } from 'svelte/store';
import type { Client, Databases, Models, RealtimeResponseEvent } from 'appwrite';
import type { Messages } from '$lib/types';
import { internalMessages } from './internalMessages';

export type MessageDocument = Messages;
export type MessagesByTicket = Record<string, MessageDocument[]>;

function createMessagesStore() {
    console.log('Creating messages store');
    const { subscribe, set, update } = writable<MessagesByTicket>({});

    const updateInternalMessages = (messages: MessagesByTicket) => {
        const allInternalMessages = Object.values(messages)
            .flat()
            .filter(msg => msg.internal === true);
        internalMessages.set(allInternalMessages);
    };

    return {
        subscribe,
        set: (value: MessagesByTicket) => {
            set(value);
            updateInternalMessages(value);
        },
        upsert: (message: MessageDocument) => {
            if (message.internal) {
                // Only update internal messages store
                internalMessages.update(msgs => {
                    const existingMsgs = msgs || [];
                    const index = existingMsgs.findIndex(m => m.$id === message.$id);
                    if (index >= 0) {
                        existingMsgs[index] = message;
                        return existingMsgs;
                    }
                    return [...existingMsgs, message];
                });
                return;
            }

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
        remove: (message: Messages) => {
            update(messages => {
                const ticketMessages = messages[message.ticket_id] || [];
                const updatedTicketMessages = ticketMessages.filter(m => m.$id !== message.$id);
                return {
                    ...messages,
                    [message.ticket_id]: updatedTicketMessages
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
                    // Group non-internal messages by ticket_id
                    const messagesByTicket = initialMessages
                        .filter(msg => !msg.internal)
                        .reduce((acc, msg) => {
                            if (!acc[msg.ticket_id]) {
                                acc[msg.ticket_id] = [];
                            }
                            acc[msg.ticket_id].push(msg);
                            return acc;
                        }, {} as MessagesByTicket);
                    
                    // Update internal messages store separately
                    const internalMsgs = initialMessages.filter(msg => msg.internal === true);
                    internalMessages.set(internalMsgs);
                    
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
                        
                        if (payload.internal) {
                            // Only update internal messages store
                            console.log('Updating internal messages store');
                            internalMessages.update(msgs => {
                                const existingMsgs = msgs || [];
                                const index = existingMsgs.findIndex(m => m.$id === payload.$id);
                                if (index >= 0) {
                                    existingMsgs[index] = payload;
                                    return existingMsgs;
                                }
                                return [...existingMsgs, payload];
                            });
                            return;
                        }

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
                        // Remove from internal messages if present
                        internalMessages.update(msgs => msgs.filter(m => m.$id !== payload.$id));
                        
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

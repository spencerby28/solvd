import { writable } from 'svelte/store';
import type { Client, Databases, RealtimeResponseEvent } from 'appwrite';
import type { Customers } from '$lib/types';

export type CustomerDocument = Customers;
export type CustomersById = Record<string, CustomerDocument>;

function createCustomersStore() {
    console.log('Creating customers store');
    const { subscribe, set, update } = writable<CustomersById>({});

    return {
        subscribe,
        set,
        upsert: (customer: CustomerDocument) => {
            console.log('Upserting customer:', customer);
            update(customers => {
                return {
                    ...customers,
                    [customer.$id]: customer
                };
            });
        },
        remove: (customerId: string) => {
            console.log('Removing customer:', customerId);
            update(customers => {
                const { [customerId]: removed, ...rest } = customers;
                return rest;
            });
        },
        // Initialize with server data and setup realtime
        initialize: (client: Client, databases: Databases) => {
            console.log('Initializing customers store');

            // Subscribe to realtime updates
            console.log('Setting up realtime subscription');
            const unsubscribe = client.subscribe(
                'databases.tickets.collections.customers.documents',
                (response: RealtimeResponseEvent<CustomerDocument>) => {
                    console.log('Received realtime event:', response.events);
                    const { events, payload } = response;
                    
                    if (events.some((e: string) => e.includes('.create') || e.includes('.update'))) {
                        console.log('Processing create/update event for customer:', payload.$id);
                        update(customers => ({
                            ...customers,
                            [payload.$id]: payload
                        }));
                    } else if (events.some((e: string) => e.includes('.delete'))) {
                        console.log('Processing delete event for customer:', payload.$id);
                        update(customers => {
                            const { [payload.$id]: removed, ...rest } = customers;
                            return rest;
                        });
                    }
                }
            );

            return unsubscribe;
        }
    };
}

export const customers = createCustomersStore(); 
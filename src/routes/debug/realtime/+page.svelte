<script lang="ts">
    import { createBrowserClient } from '$lib/appwrite-browser';
    import { tickets, messages } from '$lib/utils/realtime';
    import type { PageData } from './$types';

    export let data: PageData;
    let lastResponse: string;
    let loading = false;
    let creatingTicket = false;

    $: ticketsList = $tickets;
    $: messagesByTicket = $messages;
    $: isInitialLoading = ticketsList.length === 0 && data.ticketCount > 0;

    async function getTickets() {
        if (loading) return;
        loading = true;
        try {
            const { databases } = createBrowserClient();
            const response = await databases.listDocuments('tickets', 'tickets');
            lastResponse = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            lastResponse = JSON.stringify(error, null, 2);
        } finally {
            loading = false;
        }
    }

    async function createTicket() {
        if (creatingTicket) return;
        creatingTicket = true;
        try {
            const response = await fetch('/api/web/tickets/create?tenant=sample_team');
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            creatingTicket = false;
        }
    }

    async function sendMessage(ticketId: string, senderType: 'customer' | 'system') {
        try {
            const response = await fetch('/api/web/message/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenant_id: ticketsList.find(t => t.$id === ticketId)?.tenant_id,
                    ticket_id: ticketId,
                    sender_type: senderType
                })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
</script>

<div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-white">Realtime Tickets</h1>
    
    <div class="flex gap-4 mb-4">
        <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            on:click={getTickets}
            disabled={loading}
        >
            {#if loading}
                <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            {/if}
            {loading ? 'Fetching...' : 'Fetch Tickets'}
        </button>

        <button
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            on:click={createTicket}
            disabled={creatingTicket}
        >
            {#if creatingTicket}
                <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            {/if}
            {creatingTicket ? 'Creating...' : 'Create Ticket'}
        </button>
    </div>

    {#if lastResponse}
        <pre class="mb-4 p-4 bg-gray-800 text-gray-200 rounded overflow-auto">
            {lastResponse}
        </pre>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#if isInitialLoading}
            {#each Array(data.ticketCount) as _, i}
                <div class="bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                    <div class="flex justify-between items-start mb-3">
                        <div class="h-6 bg-gray-700 rounded w-2/3"></div>
                        <div class="h-6 bg-gray-700 rounded w-1/4"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div class="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-700">
                        <div class="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            {/each}
        {:else}
            {#each ticketsList as ticket}
                <div class="bg-gray-800 rounded-lg shadow-md p-4">
                    <div class="flex justify-between items-start mb-3">
                        <h2 class="text-lg font-semibold text-gray-200 truncate">{ticket.subject}</h2>
                        <span class="px-2 py-1 text-sm rounded-full {ticket.assigned_to ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}">
                            {ticket.assigned_to ? 'Assigned' : 'Unassigned'}
                        </span>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <p class="text-gray-300">
                            <span class="font-medium">Customer:</span> {ticket.customer_name}
                        </p>
                        <p class="text-gray-300">
                            <span class="font-medium">Category:</span> {ticket.category}
                        </p>
                        <p class="text-gray-300">
                            <span class="font-medium">Channel:</span> {ticket.channel}
                        </p>
                        {#if ticket.assigned_name}
                            <p class="text-gray-300">
                                <span class="font-medium">Assigned to:</span> {ticket.assigned_name}
                            </p>
                        {/if}
                    </div>

                    <div class="mt-4 pt-3 border-t border-gray-700">
                        <p class="text-xs text-gray-400">
                            Last seen: {new Date(ticket.customer_last_seen).toLocaleString()}
                        </p>
                    </div>

                    <!-- Chat Messages -->
                    <div class="mt-4 border-t border-gray-700 pt-4">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-md font-semibold text-gray-200">Messages</h3>
                            <a 
                                href="realtime/{ticket.$id}"
                                class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                            >
                                View Details
                            </a>
                        </div>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            {#if messagesByTicket[ticket.$id]}
                                {#each messagesByTicket[ticket.$id] as message}
                                    <div class="p-2 rounded {message.sender_type === 'system' ? 'bg-gray-700' : message.sender_type === 'customer' ? 'bg-blue-900' : 'bg-green-900'}">
                                        <div class="flex justify-between items-start">
                                            <span class="text-sm font-medium text-gray-200">{message.sender_name}</span>
                                            <span class="text-xs text-gray-400">{new Date(message.$createdAt).toLocaleString()}</span>
                                        </div>
                                        <p class="text-sm text-gray-300 mt-1">{message.content}</p>
                                    </div>
                                {/each}
                            {:else}
                                <p class="text-sm text-gray-400">No messages yet</p>
                            {/if}
                        </div>

                        <div class="mt-4 flex gap-2">
                            <button
                                class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                on:click={() => sendMessage(ticket.$id, 'customer')}
                            >
                                Send as Customer
                            </button>
                            <button
                                class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                on:click={() => sendMessage(ticket.$id, 'system')}
                            >
                                Send as System
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

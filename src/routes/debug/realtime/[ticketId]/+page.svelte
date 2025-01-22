<script lang="ts">
    import { derived } from 'svelte/store';
    import { tickets, messages } from '$lib/utils/realtime';
    import { page } from '$app/stores';

    // Get ticket ID from the URL params
    $: ticketId = $page.params.ticketId;

    // Create derived stores for this specific ticket
    const currentTicket = derived(tickets, $tickets => 
        $tickets.find(t => t.$id === ticketId)
    );

    const ticketMessages = derived(messages, $messages => 
        $messages[ticketId] || []
    );
    let realtimeStatus = 'Connected';
    let messagesContainer: HTMLDivElement;
    let prevMessageCount = 0;

    // Scroll to bottom smoothly when new messages are added
    $: if (messagesContainer && $ticketMessages) {
        const currentMessageCount = $ticketMessages.length;
        if (currentMessageCount > prevMessageCount) {
            setTimeout(() => {
                messagesContainer.scrollTo({
                    top: messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 0);
        }
        prevMessageCount = currentMessageCount;
    }

    async function sendMessage(senderType: 'customer' | 'system') {
        try {
            const response = await fetch('/api/web/message/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify({
                    tenant_id: $currentTicket?.tenant_id,
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column: Ticket Details -->
        <div class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-xl font-bold text-white mb-4">Ticket Details</h2>
            {#if $currentTicket}
                <div class="space-y-3">
                    <p class="text-gray-200">
                        <span class="font-semibold">ID:</span> {$currentTicket.$id}
                    </p>
                    <p class="text-gray-200">
                        <span class="font-semibold">Subject:</span> {$currentTicket.subject}
                    </p>
                    <p class="text-gray-200">
                        <span class="font-semibold">Customer:</span> {$currentTicket.customer_name}
                    </p>
                    <p class="text-gray-200">
                        <span class="font-semibold">Status:</span> 
                        <span class="px-2 py-1 rounded-full text-sm {$currentTicket.assigned_to ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}">
                            {$currentTicket.assigned_to ? 'Assigned' : 'Unassigned'}
                        </span>
                    </p>
                    {#if $currentTicket.assigned_name}
                        <p class="text-gray-200">
                            <span class="font-semibold">Assigned to:</span> {$currentTicket.assigned_name}
                        </p>
                    {/if}
                </div>
            {:else}
                <p class="text-gray-400">Ticket not found</p>
            {/if}
        </div>

        <!-- Right Column: Messages -->
        <div class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-xl font-bold text-white mb-4">Messages</h2>
            <div 
                bind:this={messagesContainer}
                class="space-y-4 max-h-[600px] overflow-y-auto mb-4"
            >
                {#if $ticketMessages.length > 0}
                    {#each $ticketMessages as message}
                        <div class="p-3 rounded {message.sender_type === 'system' ? 'bg-gray-700' : message.sender_type === 'customer' ? 'bg-blue-900' : 'bg-green-900'}">
                            <div class="flex justify-between items-start">
                                <span class="text-sm font-medium text-gray-200">{message.sender_name}</span>
                                <span class="text-xs text-gray-400">{new Date(message.$createdAt).toLocaleString()}</span>
                            </div>
                            <p class="text-sm text-gray-300 mt-1">{message.content}</p>
                            <div class="mt-2 text-xs text-gray-400">
                                ID: {message.$id}
                            </div>
                        </div>
                    {/each}
                {:else}
                    <p class="text-gray-400">No messages in this ticket</p>
                {/if}
            </div>

            <div class="flex gap-2">
                <button
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    on:click={() => sendMessage('customer')}
                >
                    Send as Customer
                </button>
                <button
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    on:click={() => sendMessage('system')}
                >
                    Send as System
                </button>
            </div>
        </div>
    </div>
</div>

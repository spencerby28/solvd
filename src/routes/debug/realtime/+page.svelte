<script lang="ts">
    
    import { tickets, messages } from '$lib/utils/realtime';
    import type { PageData } from './$types';
    import { Menu, MenuItem, Toggle } from 'svelte-ux';
    import type { CreateMessagePayload } from '$lib/types';

    export let data: PageData;
    let searchTerm = '';
    let statusFilter = 'all';
    let aiStatusFilter = 'all';
    let loading = false;
    let creatingTicket = false;
    let showAiMessages = false;
    $: messageContent = '';
    let isAgent = true;

    $: console.log('messageContent', messageContent);

    $: ticketsList = $tickets;
    $: messagesByTicket = $messages;
    $: isInitialLoading = ticketsList.length === 0 && data.ticketCount > 0;
    
    $: filteredTickets = ticketsList.filter(ticket => {
        const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesAiStatus = aiStatusFilter === 'all' || ticket.ai_status === aiStatusFilter;
        return matchesSearch && matchesStatus && matchesAiStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'escalated': return 'bg-red-100 text-red-800';
            case 'open': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source?.toLowerCase()) {
            case 'web': return '/svg/web.svg';
            case 'email': return '/svg/email.svg';
            case 'chat': return '/svg/chat-inactive.svg';
            default: return '/svg/web.svg';
        }
    };

    let selectedTicket: string | null = null;
    $: selectedTicketMessages = selectedTicket ? 
        (messagesByTicket[selectedTicket] || []).filter(msg => showAiMessages || msg.sender_type !== 'ai') : 
        [];
    $: selectedTicketData = selectedTicket ? ticketsList.find(t => t.$id === selectedTicket) : null;

    async function createTicket() {
        if (creatingTicket) return;
        creatingTicket = true;
        try {
            const tenant = selectedTicketData?.tenant_id || 'sample_team';
            const response = await fetch(`/api/web/tickets/createFake?tenant=${tenant}`);
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

    async function sendMessage(ticketId: string, senderType: 'customer' | 'agent') {
        console.log(`Sending message for ticket ${ticketId} as ${senderType}`);
        try {
            const ticket = filteredTickets.find(t => t.$id === ticketId);
            if (!ticket) {
                console.error('Ticket not found:', ticketId);
                throw new Error('Ticket not found');
            }

            console.log('Found ticket:', ticket);

            const messagePayload: CreateMessagePayload = {
                subject: ticket.subject || '',
                channel: ticket.channel || 'web',
                content: messageContent,
                sender_id: senderType === 'customer' ? ticket.customer_id : 'agent_1',
                sender_name: senderType === 'customer' ? ticket.customer_name : 'Support Agent',
                sender_type: senderType,
                ticket_id: ticketId,
                tenant_id: ticket.tenant_id || 'sample_team',
                email: ticket.customer_email
            };

            console.log('Sending message with payload:', messagePayload);

            const response = await fetch(`/api/web/message/${ticket.tenant_id}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messagePayload)
            });
            
            const data = await response.json();
            console.log('Received response:', data);

            if (!data.success) {
                console.error('API returned error:', data.error);
                throw new Error(data.error);
            }
            console.log('Message sent successfully');
            messageContent = '';
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    function handleSendMessage() {
        if (!selectedTicket || !selectedTicketData || !messageContent.trim()) return;
        sendMessage(selectedTicket, isAgent ? 'agent' : 'customer');
    }
</script>

<style>
    /* Hide scrollbar but keep functionality */
    .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
</style>

<div class="h-screen bg-gray-100">
    <div class="max-w-screen mx-auto h-full">
        <div class="flex h-full">
            <!-- Ticket List Sidebar -->
            <div class="w-[400px] bg-white border-r border-gray-200 flex flex-col h-full">
                <div class="p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-gray-900">Tickets</h2>
                        <button
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            on:click={createTicket}
                            disabled={creatingTicket}
                        >
                            {#if creatingTicket}
                                <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            {/if}
                            {creatingTicket ? 'Creating...' : 'New Ticket'}
                        </button>
                    </div>
                    <div class="space-y-2">
                        <input
                            type="text"
                            bind:value={searchTerm}
                            placeholder="Search tickets..."
                            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <div class="flex gap-2">
                            <Toggle let:on={open} let:toggle let:toggleOff>
                                <button
                                    class="flex-1 px-4 py-2 border rounded-lg text-left text-sm flex justify-between items-center hover:bg-gray-50"
                                    on:click={toggle}
                                >
                                    <span class="text-gray-700 font-bold">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                                    <svg class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                    <Menu {open} on:close={toggleOff} class="bg-white" matchWidth>
                                        <MenuItem on:click={() => statusFilter = 'all'}>All Status</MenuItem>
                                        <MenuItem on:click={() => statusFilter = 'open'}>Open</MenuItem>
                                        <MenuItem on:click={() => statusFilter = 'resolved'}>Resolved</MenuItem>
                                        <MenuItem on:click={() => statusFilter = 'pending'}>Pending</MenuItem>
                                        <MenuItem on:click={() => statusFilter = 'escalated'}>Escalated</MenuItem>
                                    </Menu>
                                </button>
                            </Toggle>
                            <Toggle let:on={open} let:toggle let:toggleOff>
                                <button
                                    class="flex-1 px-4 py-2 border rounded-lg text-left text-sm flex justify-between items-center hover:bg-gray-50"
                                    on:click={toggle}
                                >
                                    <span class="text-gray-700 font-bold">{aiStatusFilter === 'all' ? 'All AI Status' : aiStatusFilter}</span>
                                    <svg class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                    <Menu {open} on:close={toggleOff} class="bg-white" matchWidth>
                                        <MenuItem on:click={() => aiStatusFilter = 'all'}>All AI Status</MenuItem>
                                        <MenuItem on:click={() => aiStatusFilter = 'ai_handling'}>AI Handling</MenuItem>
                                        <MenuItem on:click={() => aiStatusFilter = 'ai_pending'}>AI Pending</MenuItem>
                                        <MenuItem on:click={() => aiStatusFilter = 'ai_escalated'}>AI Escalated</MenuItem>
                                    </Menu>
                                </button>
                            </Toggle>
                        </div>
                    </div>
                </div>

                <div class="overflow-y-auto flex-1 hide-scrollbar">
                    {#if isInitialLoading}
                        {#each Array(data.ticketCount) as _}
                            <div class="animate-pulse p-4 border-b border-gray-200">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        {/each}
                    {:else}
                        {#each filteredTickets as ticket}
                            <button
                                class="w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors {selectedTicket === ticket.$id ? 'bg-blue-50' : ''}"
                                on:click={() => selectedTicket = ticket.$id}
                            >
                                <div class="flex items-start justify-between">
                                    <div class="flex items-start space-x-3">
                                        <img 
                                            src={getSourceIcon(ticket.channel)} 
                                            alt="Ticket source" 
                                            class="w-5 h-5 mt-1"
                                        />
                                        <div>
                                            <h3 class="font-medium text-gray-900 truncate max-w-[280px]">
                                                {ticket.subject || 'Untitled'}
                                            </h3>
                                            <p class="text-sm text-gray-500 truncate max-w-[280px]">
                                                {ticket.customer_name}
                                            </p>
                                            <div class="flex items-center mt-1 space-x-2">
                                                <span class="px-2 py-1 text-xs rounded-full {getStatusColor(ticket.status || 'New')}">
                                                    {ticket.status || 'New'}
                                                </span>
                                                {#if ticket.priority}
                                                    <span class="text-xs {getPriorityColor(ticket.priority)}">
                                                        {ticket.priority}
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                    <span class="text-xs text-gray-500">
                                        {new Date(ticket.last_active).toLocaleString()}
                                    </span>
                                </div>
                            </button>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Message View -->
            <div class="flex-1 flex flex-col h-full bg-gray-50">
                {#if selectedTicket && selectedTicketData}
                    <div class="p-4 bg-white border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900">{selectedTicketData.subject || 'Untitled'}</h2>
                                <p class="text-sm text-gray-500">
                                    Customer: {selectedTicketData.customer_name} • 
                                    Last seen: {new Date(selectedTicketData.customer_last_seen).toLocaleString()}
                                </p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <!-- Status Menu -->
                                <Toggle let:on={statusOpen} let:toggle let:toggleOff>
                                    <button
                                        class="px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-gray-50 flex items-center space-x-1"
                                        on:click={toggle}
                                    >
                                        <span class={getStatusColor(selectedTicketData.status || 'New')}>
                                            {selectedTicketData.status || 'New'}
                                        </span>
                                        <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                        <Menu {statusOpen} on:close={toggleOff}>
                                            <MenuItem>Open</MenuItem>
                                            <MenuItem>Pending</MenuItem>
                                            <MenuItem>Resolved</MenuItem>
                                            <MenuItem>Escalated</MenuItem>
                                        </Menu>
                                    </button>
                                </Toggle>

                                <!-- Assign Menu -->
                                <Toggle let:on={assignOpen} let:toggle let:toggleOff>
                                    <button
                                        class="px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-gray-50 flex items-center space-x-1"
                                        on:click={toggle}
                                    >
                                        <span>
                                            {selectedTicketData.assigned_name || 'Assign'}
                                        </span>
                                        <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                        <Menu {assignOpen} on:close={toggleOff}>
                                            <MenuItem>John Doe</MenuItem>
                                            <MenuItem>Jane Smith</MenuItem>
                                            <MenuItem>Unassigned</MenuItem>
                                        </Menu>
                                    </button>
                                </Toggle>

                                <!-- More Menu -->
                                <Toggle let:on={moreOpen} let:toggle let:toggleOff>
                                    <button
                                        class="p-1.5 text-gray-500 rounded-lg hover:bg-gray-50"
                                        on:click={toggle}
                                    >
                                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                        <Menu {moreOpen} on:close={toggleOff}>
                                            <MenuItem>View Details</MenuItem>
                                            <MenuItem>Copy ID</MenuItem>
                                            <MenuItem class="text-red-600">Close Ticket</MenuItem>
                                        </Menu>
                                    </button>
                                </Toggle>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
                        {#if selectedTicketMessages.length > 0}
                            {#each selectedTicketMessages as message}
                                <div class="flex {message.sender_type === 'customer' ? 'justify-start' : 'justify-end'}">
                                    <div class="flex items-start max-w-[70%] {message.sender_type === 'customer' ? 'flex-row' : 'flex-row-reverse'}">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-full {message.sender_type === 'customer' ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center mx-2">
                                            {#if message.sender_type === 'customer'}
                                                <span class="text-blue-600 font-medium text-sm">C</span>
                                            {:else}
                                                <span class="text-green-600 font-medium text-sm">A</span>
                                            {/if}
                                        </div>
                                        <div>
                                            <div class="flex items-center space-x-2 mb-1 {message.sender_type === 'customer' ? '' : 'flex-row-reverse space-x-reverse'}">
                                                <span class="text-sm font-medium text-gray-900">{message.sender_name}</span>
                                                <span class="text-xs text-gray-500">{new Date(message.$createdAt).toLocaleString()}</span>
                                            </div>
                                            <div class="rounded-2xl px-4 py-2 {message.sender_type === 'customer' ? 'bg-blue-50 text-blue-900' : 'bg-green-50 text-green-900'}">
                                                <p class="text-sm whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="flex items-center justify-center h-full">
                                <p class="text-gray-500">No messages in this ticket</p>
                            </div>
                        {/if}
                    </div>

                    <div class="p-4 bg-white border-t border-gray-200">
                        <div class="flex gap-2 flex-col">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm text-gray-600">Sending as:</span>
                                <button
                                    class="px-3 py-1 rounded-full text-sm font-medium {isAgent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}"
                                    on:click={() => isAgent = true}
                                >
                                    Agent
                                </button>
                                <button
                                    class="px-3 py-1 rounded-full text-sm font-medium {!isAgent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}"
                                    on:click={() => isAgent = false}
                                >
                                    Customer
                                </button>
                            </div>
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    bind:value={messageContent}
                                    placeholder="Type your message..."
                                    class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                />
                                <button
                                    class="px-4 py-2 {isAgent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    on:click={handleSendMessage}
                                    disabled={!messageContent.trim()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="flex items-center justify-center h-full text-gray-500">
                        Select a ticket to view messages
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

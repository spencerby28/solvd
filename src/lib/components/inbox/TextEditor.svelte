<script lang="ts">
    import {inboxActions} from '$lib/stores/inboxActions';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';
    import {Upload, HelpCircle, Brain, SquarePen} from 'lucide-svelte';

    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    
    $: console.log($inboxActions.internalMessage);
    export let user: any

    async function handleSendMessage() {
        console.log(messageContent);
        if (!messageContent.trim()) return;
        
        try {
            if (!$selectedTicket) {
                throw new Error('Ticket not found');
            }

            const response = await fetch(`/api/web/message/${$selectedTicket.tenant_id}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: messageContent,
                    ticket_id: $selectedTicket.$id,
                    sender_type: 'agent',
                    channel: $selectedTicket.channel,
                    subject: $selectedTicket.subject || '',
                    sender_id: user?.$id || '',
                    customer_id: $selectedTicket.customer_id,
                    sender_name: user?.name || '',
                    tenant_id: $selectedTicket.tenant_id,
                    email: $selectedTicket.customer_email,
                    internal: $inboxActions.internalMessage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageContent = '';
            inboxActions.setInternalMessage(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    
    let messageContent = '';
</script>

<div class="flex-shrink-0 p-4 bg-white border-t border-gray-200 ">
    <div class="flex gap-2 flex-col">
        {#if $inboxActions.internalMessage}
            <div class="text-sm text-gray-500 -mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span>This is an internal note - the customer won't see it</span>
            </div>
        {/if}
        
        <div class="flex items-center gap-3 mb-3">
            {#if !$inboxActions.internalMessage}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div on:click={() => inboxActions.toggleEditMode()}>
                    <RippleButton 
                        class={`p-2 text-sm ${$inboxActions.isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 rounded-lg flex items-center gap-2 ${$inboxActions.isEditMode ? 'text-white' : 'text-gray-700'}`}
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <SquarePen class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                            <span class={$inboxActions.isEditMode ? 'font-bold' : ''}>{$inboxActions.isEditMode ? 'Edit Mode' : 'Edit'}</span>
                        </div>
                    </RippleButton>
                </div>

                {#if !$inboxActions.isEditMode}
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <Upload class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                            Attach
                        </div>
                    </RippleButton>

                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <HelpCircle class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                            Help Desk
                        </div>
                    </RippleButton>
                    <RippleButton 
                        class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                        rippleColor="#16a34a"
                        duration="500ms"
                    >
                        <div class="flex items-center gap-2">
                            <Brain class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                            SolvdAI
                        </div>
                    </RippleButton>
                {/if}
            {/if}
        </div>
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={messageContent}
                placeholder={$inboxActions.internalMessage ? 'Type your internal note...' : 'Type your message...'}
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm min-h-[40px] outline-none transition-shadow duration-200"
                on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            />
      
                <RippleButton 
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={handleSendMessage}
                    disabled={!messageContent.trim()}
                    rippleColor="#166534"
                    duration="1000ms"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </RippleButton>
            
        </div>
    </div>
</div>
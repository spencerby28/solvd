<script lang="ts">
    import {inboxActions} from '$lib/stores/inboxActions';
    import { selectedTicket } from '$lib/stores/selectedTicket';

    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    

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
                    email: $selectedTicket.customer_email
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageContent = '';
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    
    let messageContent = '';
</script>




<div class="flex-shrink-0 p-4 bg-white border-t border-gray-200">
    <div class="flex gap-2 flex-col">
        <div class="flex items-center gap-3 mb-3">

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div on:click={() => inboxActions.toggleEditMode()}>
                <RippleButton 
                    class={`p-2 text-sm ${$inboxActions.isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 rounded-lg flex items-center gap-2 ${$inboxActions.isEditMode ? 'text-white' : 'text-gray-700'}`}
                    rippleColor="#16a34a"
                    duration="500ms"
                >
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                        <span class="font-bold">{$inboxActions.isEditMode ? 'Edit Mode' : 'Edit'}</span>
                    </div>
                </RippleButton>
            </div>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#16a34a"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                    </svg>
                    Reminder
                </div>
            </RippleButton>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#16a34a"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clip-rule="evenodd" />
                    </svg>
                    Help Desk
                </div>
            </RippleButton>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#16a34a"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    SolvdAI
                </div>
            </RippleButton>
        </div>
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={messageContent}
                placeholder="Type your message..."
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm min-h-[40px] outline-none transition-shadow duration-200"
                on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            />
            <div on:click={handleSendMessage}>
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
</div>
<script>
    let isMinimized = true;
    
    function toggleChat() {
        isMinimized = !isMinimized;
    }
</script>

<slot />

<div class="chat-widget" class:minimized={isMinimized}>
    <div class="chat-header">

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button class="minimize-icon" on:click={toggleChat}>
            <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <svg class="chat-icon" viewBox="0 0 24 24" fill="white" on:click={toggleChat}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
    </div>
    <iframe 
        src="/chat/tenant"
        class="chat-iframe"
        title="Chat widget"
        allowfullscreen>
    </iframe>
</div>

<style>
    .chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        overflow: hidden;
        z-index: 1000;
    }

    .chat-widget.minimized {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        overflow: hidden;
    }

    .chat-header {
        padding: 5px 10px;
        background: #3b82f6;
        color: white;
        border-radius: 0;
        cursor: default;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 24px;
    }

    .minimized .chat-header {
        border-radius: 30px;
        padding: 0;
        height: 60px;
        width: 60px;
        justify-content: center;
    }

    .chat-iframe {
        width: 100%;
        height: calc(100% - 24px);
        border: none;
    }

    .minimized .chat-iframe {
        display: none;
    }

    .chat-icon {
        width: 24px;
        height: 24px;
        display: none;
    }

    .minimized .chat-icon {
        display: block;
        cursor: pointer;
    }

    .minimize-icon {
        width: 14px;
        height: 14px;
        cursor: pointer;
        background: none;
        border: none;
        color: white;
        padding: 0;
        opacity: 0.8;
        transition: opacity 0.2s;
    }

    .minimize-icon:hover {
        opacity: 1;
    }

    .minimized .minimize-icon {
        display: none;
    }
</style>

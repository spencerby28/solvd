import { writable } from 'svelte/store';

interface InboxActions {
    isEditMode: boolean;
    selectedMessageId: string | null;
}

function createInboxActionsStore() {
    const { subscribe, set, update } = writable<InboxActions>({
        isEditMode: false,
        selectedMessageId: null
    });

    return {
        subscribe,
        toggleEditMode: () => update(state => ({ ...state, isEditMode: !state.isEditMode })),
        setSelectedMessage: (messageId: string | null) => update(state => ({ ...state, selectedMessageId: messageId })),
        reset: () => set({ isEditMode: false, selectedMessageId: null })
    };
}

export const inboxActions = createInboxActionsStore(); 
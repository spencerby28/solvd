import { writable } from 'svelte/store';
interface InboxActions {
    isEditMode: boolean;
    selectedMessageId: string | null;
    internalMessage: boolean;
}

function createInboxActionsStore() {
    const { subscribe, set, update } = writable<InboxActions>({
        isEditMode: false,
        selectedMessageId: null,
        internalMessage: false
    });

    return {
        subscribe,
        toggleEditMode: () => update(state => ({ ...state, isEditMode: !state.isEditMode })),
        setSelectedMessage: (messageId: string | null) => update(state => ({ ...state, selectedMessageId: messageId })),
        reset: () => set({ isEditMode: false, selectedMessageId: null, internalMessage: false }),
        toggleInternalMessage: () => update(state => ({ ...state, internalMessage: !state.internalMessage })),
        setInternalMessage: (internal: boolean) => update(state => ({ ...state, internalMessage: internal }))
    };
}

export const inboxActions = createInboxActionsStore();
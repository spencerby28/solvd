export async function deleteMessage(tenantId: string, messageId: string, ticketId: string) {
    try {
        const response = await fetch(`/api/web/message/${tenantId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticketId,
                messageId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete internal message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting internal message:', error);
        throw error;
    }
}



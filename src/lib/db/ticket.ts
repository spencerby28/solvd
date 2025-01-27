export async function updateTicketStatus(ticketId: string, status: string, userName: string) {
    try {
        const response = await fetch(`/api/web/tickets/update?status=${status.toUpperCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticketId,
                userName
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update ticket status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
    }
}

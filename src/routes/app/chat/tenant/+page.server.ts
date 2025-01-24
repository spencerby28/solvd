import { OPENAI_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';

export const actions = {
	sendMessage: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const message = data.get('message')?.toString();
		const chatHistoryStr = data.get('chatHistory')?.toString();

		if (!message) {
			throw error(400, 'Message is required');
		}

		try {
			// Parse chat history, defaulting to empty array if not provided
			const chatHistory = chatHistoryStr ? JSON.parse(chatHistoryStr) : [];

			console.log('Chat history:', chatHistory);

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_KEY}`
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: [
						{
							role: 'system',
							content: `You are a paint store assistant. Keep responses brief and direct. Available products:

Classic White ($29.99)
Ocean Blue ($34.99)
Forest Green ($32.99) 
Sunset Orange ($31.99)
Royal Purple ($33.99)
Ruby Red ($35.99)
Sunshine Yellow ($30.99)
Turquoise Dream ($36.99)

Help customers choose the right paint color based on their needs, room type, mood, and other relevant factors.`
						},
						...chatHistory.map((msg: { role: string; content: string }) => ({
							role: msg.role,
							content: msg.content
						})),
						{ role: 'user', content: message }
					]
				})
			});

			const result = await response.json();
			console.log('Token usage:', {
				prompt_tokens: result.usage.prompt_tokens,
				completion_tokens: result.usage.completion_tokens,
				total_tokens: result.usage.total_tokens
			});
			return {
				success: true,
				message: result.choices[0].message.content
			};
		} catch (err) {
			console.error('OpenAI API Error:', err);
			throw error(500, 'Failed to get response from AI');
		}
	}
} satisfies Actions;

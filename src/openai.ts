import { addMessage, fetchUserMessages } from './db';
import { telegramReply } from './telegram';
import { IHistoryItem, IOpenAIResponse } from './types';

declare const CHAT_API_KEY: string;

async function openaiRequest(
  messages: IHistoryItem[]
): Promise<IOpenAIResponse> {
  const url = `https://api.openai.com/v1/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CHAT_API_KEY}`,
  };
  const body = {
    model: 'gpt-3.5-turbo',
    messages,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function launchOpenAI(chatId: string, userId: string) {
  try {
    const messages = (await fetchUserMessages(userId, chatId)) || [];
    if (messages.length === 0) {
      return telegramReply(
        'Sorry, I can not help you with that 🤖. Please try again',
        chatId
      );
    }
    const pureMessages = messages.map(({ role, content, name }) => ({
      role,
      content,
      name,
    }));
    const response = await openaiRequest(pureMessages);

    const completionText = response?.choices?.[0]?.message?.content;
    if (!completionText) {
      throw new Error('No completion text');
    }

    await addMessage(userId, chatId, {
      role: 'assistant',
      content: completionText,
      name: 'Zholdas',
    });

    return telegramReply(completionText, chatId);
  } catch (error: any) {
    return telegramReply(
      'No response from openAI 🤖 ' + error.toString(),
      chatId
    );
  }
}

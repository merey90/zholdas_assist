import { deleteUserMessages, fetchUserMessages, addMessage } from './db';
import { IHistoryItem, IOpenAIResponse, ITelegramResponse } from './types';

declare const TELEGRAM_API_KEY: string;
declare const USER_LIST: string;
declare const CHAT_API_KEY: string;

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

function isUserAllowed(userId: string) {
  const userList = USER_LIST.split(',');
  return userList.includes(userId);
}

async function telegramReply(message: string, chatId: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`;
  await fetch(url);
  return new Response('OK');
}

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
    max_tokens: 1000, // TODO: accept more than 1000 characters and split into multiple resonses
    messages,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return response.json();
}

async function launchOpenAI(chatId: string, userId: string) {
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

    addMessage(userId, chatId, {
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

async function handleRequest(request: Request) {
  if (request.method !== 'POST') {
    return new Response('OK');
  }

  const payload: ITelegramResponse = await request.json();
  const message = payload?.message;
  if (!message) {
    return new Response('OK');
  }

  // Check if message was sent from group and the bot was mentioned
  const isGroupMessage = message.chat.type !== 'private';
  const isBotMentioned =
    ['mention', 'bot_command'].includes(message.entities?.[0]?.type) &&
    message.text?.includes('@zholdas_assist_bot');
  if (isGroupMessage && !isBotMentioned) {
    return new Response('OK');
  }

  const chatId = message.chat.id.toString();
  const userId = message.from.id.toString();
  if (!isUserAllowed(userId)) {
    return telegramReply(
      `Sorry, ${userId}, you are not allowed to use my 🤖`,
      chatId
    );
  }

  const userInput = message.text?.replace('@zholdas_assist_bot', '').trim();
  if (!userInput) {
    return telegramReply("Sorry, I can't understand you 🤖", chatId);
  }

  if (userInput === '/history') {
    try {
      const messages = await fetchUserMessages(userId, chatId);
      return telegramReply(JSON.stringify(messages), chatId);
    } catch (error) {
      return telegramReply(JSON.stringify(error), chatId);
    }
  }

  if (userInput === '/clear') {
    try {
      await deleteUserMessages(userId, chatId);
      return telegramReply('History cleared', chatId);
    } catch (error) {
      return telegramReply(JSON.stringify(error), chatId);
    }
  }

  if (userInput.length < 10) {
    return telegramReply('Please type at least 10 characters', chatId);
  }

  try {
    await addMessage(userId, chatId, {
      role: 'user',
      content: userInput,
      name: userId.toString(),
    });
  } catch (error) {
    return telegramReply(JSON.stringify(error), chatId);
  }

  return await launchOpenAI(chatId, userId);
}

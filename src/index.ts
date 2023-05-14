import { deleteUserMessages, fetchUserMessages, addMessage } from './db';
import { launchOpenAI } from './openai';
import { telegramReply } from './telegram';
import { ITelegramResponse } from './types';

declare const USER_LIST: string;

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

function isUserAllowed(userId: string) {
  const userList = USER_LIST.split(',');
  return userList.includes(userId);
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

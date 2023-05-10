import {
  IChatHistory,
  IHistoryItem,
  IOpenAIResponse,
  ITelegramResponse,
} from './types';

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

const history: IChatHistory = {};

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

async function handleRequest(request: Request<unknown, CfProperties<unknown>>) {
  if (request.method !== 'POST') {
    return new Response('OK');
  }

  const payload = await request.json<ITelegramResponse>();
  if (!payload?.message) {
    return new Response('OK');
  }

  //check if message was sent from group and the bot was mentioned
  const chatId = payload.message.chat.id;
  const isGroupMessage = payload.message.chat.type !== 'private';
  const isBotMentioned =
    payload.message.entities?.length &&
    payload.message.entities[0].type === 'mention';
  const isBotMentionedInText = payload.message.text?.includes(
    '@zholdas_assist_bot'
  );
  if (isGroupMessage && !isBotMentioned && isBotMentionedInText) {
    return new Response('OK');
  }

  const userId = payload.message.from.id.toString();
  if (!isUserAllowed(userId)) {
    return telegramReply(
      `Sorry, ${userId}, you are not allowed to use my 🤖`,
      chatId
    );
  }

  const userInput = payload.message.text
    ?.replace('@zholdas_assist_bot', '')
    .trim();
  if (!userInput) {
    return telegramReply("Sorry, I can't understand you 🤖", chatId);
  }

  // init history if not exists
  if (!history[chatId] || !history[chatId][userId]) {
    history[chatId] = {};
    history[chatId][userId] = [];
  }

  if (userInput.length < 10 && userInput === '/clear') {
    history[chatId][userId] = [];
    return telegramReply('History cleared', chatId);
  } else if (userInput.length < 10) {
    return telegramReply(
      'Please type at least 10 characters to get a response 🤖',
      chatId
    );
  }

  history[chatId][userId].push({
    role: 'user',
    content: userInput,
  });

  try {
    const completion = await openaiRequest(history[chatId][userId]);

    const completionText = completion?.choices[0]?.message?.content;
    if (!completionText) {
      throw new Error('No completion text');
    }
    history[chatId][userId].push({
      role: 'assistant',
      content: completionText,
    });
    return telegramReply(completionText, chatId);
  } catch (error: any) {
    return telegramReply(
      'No response from openAI 🤖 ' + error.toString(),
      chatId
    );
  }
}

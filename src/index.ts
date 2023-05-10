import { IHistoryItem, ITelegramResponse } from './types';
import { Configuration, OpenAIApi } from 'openai';

declare const TELEGRAM_API_KEY: string;
declare const USER_LIST: string;
declare const CHAT_API_KEY: string;
const configuration = new Configuration({
  apiKey: CHAT_API_KEY,
});
const openai = new OpenAIApi(configuration);

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

function isUserAllowed(username: string) {
  const userList = USER_LIST.split(',');
  return userList.includes(username);
}

const history: IHistoryItem[] = [];

async function handleRequest(request: Request<unknown, CfProperties<unknown>>) {
  if (request.method !== 'POST') {
    return new Response('OK');
  }

  const payload = await request.json<ITelegramResponse>();
  if (!payload?.message) {
    return new Response('OK');
  }

  const chatId = payload.message.chat.id;
  const username = payload.message.chat.username;
  if (!isUserAllowed(username)) {
    const text = 'Sorry, you are not allowed to use my 🤖';
    const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
    const data = await fetch(url).then((resp) => resp.json());
    return new Response('OK');
  }

  const userInput = payload.message.text?.trim();
  if (!userInput || userInput.length < 10) {
    const text = "Sorry, I can't understand you 🤖";
    const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
    const data = await fetch(url).then((resp) => resp.json());
    return new Response('OK');
  }
  const text = 'bot reply';
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
  const data = await fetch(url).then((resp) => resp.json());
  return new Response('OK');
}

import { ITelegramResponse } from './types';
declare const TELEGRAM_API_KEY: string;
declare const USER_LIST: string;

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

export interface Env {
  TELEGRAM_API_KEY: string;
}

function isUserAllowed(username: string) {
  const userList = USER_LIST.split(',');
  return userList.includes(username);
}

async function handleRequest(request: Request<unknown, CfProperties<unknown>>) {
  if (request.method === 'POST') {
    const payload = await request.json<ITelegramResponse>();
    if ('message' in payload) {
      const chatId = payload.message.chat.id;
      const username = payload.message.chat.username;
      if (!isUserAllowed(username)) {
        const text = 'Sorry, you are not allowed to use my 🤖 ';
        const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
        const data = await fetch(url).then((resp) => resp.json());
      } else {
        const text =
          payload.message.text + ' over ' + payload.message.chat.username;
        const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
        const data = await fetch(url).then((resp) => resp.json());
      }
    }
  }
  return new Response('OK');
}

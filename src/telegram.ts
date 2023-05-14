declare const TELEGRAM_API_KEY: string;

function splitMessage(message: string) {
  const messages = [];
  while (message.length > 0) {
    messages.push(message.substring(0, 4090));
    message = message.substring(4090);
  }
  return messages;
}

export async function telegramReply(message: string, chatId: string) {
  const messages = splitMessage(message);
  for (const message of messages) {
    const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`;
    await fetch(url);
  }
  return new Response('OK');
}

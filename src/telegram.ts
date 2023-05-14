declare const TELEGRAM_API_KEY: string;

export async function telegramReply(message: string, chatId: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`;
  await fetch(url);
  return new Response('OK');
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === "POST") {
    const payload = await request.json() 
    // Getting the POST request JSON payload
    if ('message' in payload) { 
      // Checking if the payload comes from Telegram
      const chatId = payload.message.chat.id

      if(payload.message.chat.username !== "merey90") {
        const text = "Sorry, you are not allowed to use my 🤖"
        const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`
        const data = await fetch(url).then(resp => resp.json()) 
      }
      else {
        const text = payload.message.text + " over " + payload.message.chat.username
        const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`
        const data = await fetch(url).then(resp => resp.json()) 
      }
    }
  }
  return new Response("OK") // Doesn't really matter
}

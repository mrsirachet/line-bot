const express = require('express')
const line = require('@line/bot-sdk')

const app = express()

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}

const client = new line.Client(config)

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events

    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'คุณพิมพ์ว่า: ' + event.message.text
        })
      }
    }))

    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})

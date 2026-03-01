require('dotenv').config()
const express = require('express')
const line = require('@line/bot-sdk')
const axios = require('axios')

const app = express()

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
}

const client = new line.Client(config)

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events

    await Promise.all(events.map(async (event) => {

      if (event.type !== 'message' || event.message.type !== 'text') {
        return
      }

      const userText = event.message.text

      const systemPrompt = `
คุณคือ "เข็มทิศชีวิต - Life Compass AI"
คุณเป็นที่ปรึกษาเชิงกลยุทธ์ด้านชีวิต ธุรกิจ และการเติบโตส่วนบุคคล

โครงสร้างคำตอบต้องมี:
1) วิเคราะห์สถานการณ์
2) มุมมองเชิงลึก
3) แผนปฏิบัติ 3 ข้อ
4) คำถามสะท้อนคิด 1 ข้อ

ตอบกระชับ มืออาชีพ มีพลัง
ตอนท้ายให้ปิดด้วย:
"หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้"
`

      const aiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      )

      const replyText = aiResponse.data.choices[0].message.content

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText.substring(0, 4900)
      })

    }))

    res.sendStatus(200)

  } catch (err) {
    console.error(err.response?.data || err.message)
    res.sendStatus(500)
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})

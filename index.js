require('dotenv').config()
const express = require('express')
const line = require('@line/bot-sdk')

const app = express()

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
}

const client = new line.Client(config)

function analyzeIntent(text) {
  const lower = text.toLowerCase()

  if (lower.includes("สับสน") || lower.includes("อนาคต")) {
    return "future_confusion"
  }
  if (lower.includes("เงิน") || lower.includes("รายได้") || lower.includes("ธุรกิจ")) {
    return "financial_growth"
  }
  if (lower.includes("เครียด") || lower.includes("หมดไฟ") || lower.includes("เหนื่อย")) {
    return "burnout"
  }
  if (lower.includes("ความสัมพันธ์") || lower.includes("แฟน") || lower.includes("ครอบครัว")) {
    return "relationship"
  }

  return "general"
}

function generateResponse(intent, userText) {

  const templates = {

    future_confusion: `
🔎 วิเคราะห์สถานการณ์  
คุณกำลังอยู่ในช่วงหัวเลี้ยวหัวต่อของชีวิต ความสับสนมักเกิดเมื่อคุณกำลังเติบโตเกินกรอบเดิม

🧭 มุมมองเชิงลึก  
ความไม่ชัดเจนไม่ได้แปลว่าคุณไม่มีทิศทาง แต่แปลว่าคุณกำลังต้องการ “เข็มทิศภายใน” ที่ชัดขึ้น

🚀 แผนปฏิบัติ 3 ข้อ  
1) เขียนภาพชีวิตที่ต้องการในอีก 3 ปี  
2) ระบุทักษะที่ต้องพัฒนา  
3) เลือก 1 การกระทำเล็ก ๆ ที่เริ่มได้ภายใน 7 วัน

❓ คำถามสะท้อนคิด  
ถ้าไม่มีความกลัว คุณจะเลือกทางไหน?

หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้
`,

    financial_growth: `
🔎 วิเคราะห์สถานการณ์  
คุณกำลังมองหาการเติบโตทางการเงิน ซึ่งสะท้อนว่าคุณต้องการยกระดับชีวิต

🧭 มุมมองเชิงลึก  
รายได้คือผลลัพธ์ของ “คุณค่า” ที่คุณสร้าง ไม่ใช่แค่จำนวนชั่วโมงที่ทำงาน

🚀 แผนปฏิบัติ 3 ข้อ  
1) ประเมินจุดแข็งที่สร้างมูลค่าสูงสุด  
2) หาช่องทางเพิ่ม leverage (ออนไลน์ / ทีม / ระบบ)  
3) สร้างแผน 90 วันชัดเจน

❓ คำถามสะท้อนคิด  
วันนี้คุณสร้างคุณค่าอะไรที่แตกต่างจากคนอื่น?

หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้
`,

    burnout: `
🔎 วิเคราะห์สถานการณ์  
อาการเหนื่อยล้าไม่ใช่ความอ่อนแอ แต่เป็นสัญญาณว่าระบบชีวิตคุณกำลังไม่สมดุล

🧭 มุมมองเชิงลึก  
หมดไฟมักเกิดเมื่อคุณให้พลังงานมากกว่าที่เติมกลับ

🚀 แผนปฏิบัติ 3 ข้อ  
1) ตัดงานที่ไม่จำเป็น 1 อย่าง  
2) จัดเวลาพักฟื้นจริงจัง  
3) ทบทวนเป้าหมายว่ามันยังใช่หรือไม่

❓ คำถามสะท้อนคิด  
อะไรในชีวิตคุณกำลังดูดพลังมากที่สุด?

หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้
`,

    relationship: `
🔎 วิเคราะห์สถานการณ์  
ความสัมพันธ์คือกระจกสะท้อนตัวตนและความคาดหวังของเรา

🧭 มุมมองเชิงลึก  
ปัญหาความสัมพันธ์มักไม่ใช่เรื่อง “เขา” แต่คือรูปแบบการสื่อสารและความต้องการที่ยังไม่ชัด

🚀 แผนปฏิบัติ 3 ข้อ  
1) เขียนสิ่งที่คุณต้องการจริง ๆ  
2) สื่อสารด้วยภาษาความรู้สึก  
3) ฟังโดยไม่โต้แย้งทันที

❓ คำถามสะท้อนคิด  
คุณกำลังคาดหวังอะไรที่ยังไม่ได้บอก?

หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้
`,

    general: `
🔎 วิเคราะห์สถานการณ์  
จากสิ่งที่คุณเล่า สะท้อนว่าคุณกำลังอยู่ในช่วงต้องการความชัดเจน

🧭 มุมมองเชิงลึก  
ทุกความท้าทายคือโอกาสในการออกแบบชีวิตใหม่

🚀 แผนปฏิบัติ 3 ข้อ  
1) ระบุปัญหาหลักให้ชัด  
2) แตกเป้าหมายเป็นขั้นตอนเล็ก  
3) ลงมือทันทีในสิ่งที่ควบคุมได้

❓ คำถามสะท้อนคิด  
ถ้าคุณต้องตัดสินใจวันนี้ คุณจะเลือกอะไร?

หากต้องการวิเคราะห์เชิงลึกแบบส่วนตัว สามารถติดต่อทีม Life Compass ได้
`
  }

  return templates[intent]
}

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events

    await Promise.all(events.map(async (event) => {

      if (event.type !== 'message' || event.message.type !== 'text') {
        return
      }

      const userText = event.message.text
      const intent = analyzeIntent(userText)
      const replyText = generateResponse(intent, userText)

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText
      })
    }))

    res.sendStatus(200)

  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Demo Mode Running')
})

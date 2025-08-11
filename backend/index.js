import express from "express"
import ImageKit from "imagekit"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import Chat from "./models/chat.js"
import UserChats from "./models/userChats.js"
import { clerkMiddleware } from '@clerk/express'
import { requireAuth } from '@clerk/express'
const port = process.env.PORT || 3001
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
}));
app.use(clerkMiddleware())
app.use(express.json())

app.use(express.static(path.join(__dirname, "./public/dist")))
const connect = async () => {
  try {
    // console.log(process.env.MONGO)
    await mongoose.connect(process.env.MONGO)
    console.log("Connected to Mongo")
  } catch (err) {
    console.log(err);
  }
}

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
})

app.get('/api/upload', (req, res) => {
  const result = imagekit.getAuthenticationParameters()
  res.send(result)
})

app.post('/api/chats', requireAuth(), async (req, res) => {
  const userId = req.auth().userId
  const { text } = req.body
  try {
    // 创建一个新对话
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }]
    })
    const saveChat = await newChat.save()

    // 检查用户聊天列表是否存在
    const userChats = await UserChats.find({ userId: userId })

    // 如果不存在，就创建一个新的
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [{
          _id: saveChat._id,
          title: text.substring(0, 40),
        }]
      })
      await newUserChats.save()
    } else {
      // 如果存在就加入到列表中
      await UserChats.updateOne({ userId: userId }, {
        $push: {
          chats: {
            _id: saveChat._id,
            title: text.substring(0, 40),
          }
        }
      })
      res.status(201).send(newChat._id)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send("Error creating chat!")
  }
})

app.get('/api/userchats', requireAuth(), async (req, res) => {
  const userId = req.auth().userId
  try {
    const userChats = await UserChats.find({ userId })
    res.status(200).send(userChats[0].chats)
  } catch (error) {
    console.log(error)
    res.status(500).send("Error fetching userchats!")
  }
})


app.get('/api/chat/:id', requireAuth(), async (req, res) => {
  const userId = req.auth().userId
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId })
    res.status(200).send(chat)
  } catch (error) {
    console.log(error)
    res.status(500).send("Error fetching chat!")
  }
})

app.put('/api/chat/:id', requireAuth(), async (req, res) => {
  const userId = req.auth().userId
  const id = req.params.id
  const { question, answer, img } = req.body
  const newItem = [...(question ? [{ role: "user", parts: [{ text: question }], ...img && { img } }] : []), { role: "model", parts: [{ text: answer }] }]
  try {
    const updateChat = await Chat.updateOne({ _id: id, userId }, {
      $push: {
        history: { $each: newItem },
      }
    })
    res.status(200).send(updateChat)
  } catch (error) {
    console.log(error)
    res.status(500).send("Error put conversation!")
  }
})

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "./public/dist", "index.html"))
})

app.listen(port, () => {
  connect()
  console.log("server running in 80");
})
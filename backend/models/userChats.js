import mongoose from "mongoose";

const userChatsSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  chats: [
    {
      _id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    }

  ]
}, { timesTamp: true })

export default mongoose.models.userChats || mongoose.model("userChats", userChatsSchema)
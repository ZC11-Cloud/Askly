import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  history: [
    {
      role: {
        type: String,
        enum: ["user", "model"],
        required: true,
      },
      parts: [
        {
          text: {
            type: String,
            required: true,
          }
        }
      ],
      img: {
        type: String,
        required: false
      }
    }
  ]
}, {timesTamp: true})

export default mongoose.models.chat || mongoose.model("chat", chatSchema)
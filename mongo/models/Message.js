import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
  type: { type: String, required: true },
  content: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  toBeSentAt: { type: Date, required: true },
  status: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, required: true },
  sid: String,
});

export const Message = mongoose.model("Message", messageSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const canTrackerSchema = new Schema({
  petId: { type: Schema.Types.ObjectId, required: true },
  petName: { type: String, required: true },
  initCanCount: { type: Number, required: true },
  canLeft: { type: Number, required: true },
  canIntake: { type: Number, required: true },
  markedForSending: { type: Boolean, required: true },
  //   messageSent: { type: Boolean, required: true },
});

export const CanTracker = mongoose.model("CanTracker", canTrackerSchema);

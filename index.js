import { connectMongoDB } from "./mongo/connection/connectMongoDB.js";
import { Message } from "./mongo/models/Message.js";
import { CanTracker } from "./mongo/models/CanTracker.js";
import cron from "node-cron";
import dotenv from "dotenv";
import { sendMessage } from "./utils/sendMessage.js";

dotenv.config();
await connectMongoDB();

//Event messages:
const messagesController = async function () {
  try {
    console.log("Scanning messages for sending...");

    const messages = await Message.find({
      status: "awaiting",
      toBeSentAt: { $lte: new Date() },
    });

    for (const message of messages) {
      message.sid = await sendMessage(
        message.content,
        message.from,
        message.to
      );
      message.status = "sent";
      await message.save();
    }
  } catch (error) {
    console.log("Something went wrong!");
    console.log(error);
    messagesAt09.stop();
    messagesAt12.stop();
    messagesAt15.stop();
  }
};

const messagesAt09 = cron.schedule("0 9 * * *", messagesController);
const messagesAt12 = cron.schedule("0 12 * * *", messagesController);
const messagesAt15 = cron.schedule("0 15 * * *", messagesController);

//Low can lvls messages:
const foodController = async () => {
  console.log("Scanning CanTrackers...");
  try {
    const canTrackers = await CanTracker.find({
      canLeft: { $gt: 0 },
    });

    console.log(canTrackers);

    for (const canTracker of canTrackers) {
      canTracker.canLeft = canTracker.canLeft - canTracker.canIntake;

      if (canTracker.canLeft < 0) {
        canTracker.canLeft = 0;
      }

      if (
        canTracker.canLeft / canTracker.initCanCount <= 0.25 &&
        !canTracker.markedForSending
      ) {
        const newMessage = new Message({
          type: "food",
          content: `Attention, the number of cans of ${canTracker.petName}'s food left is ${canTracker.canLeft}. Replenish your supplies!`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.DEFAULT_PHONE_NUMBER,
          toBeSentAt: Date.now(),
          status: "awaiting",
          assignedTo: canTracker._id,
        });

        await newMessage.save();

        canTracker.markedForSending = true;
      }

      await canTracker.save();
    }
  } catch (error) {
    console.log(error);
    foodCheckup.stop();
  }
};

const foodCheckup = cron.schedule("0 0 * * *", foodController);

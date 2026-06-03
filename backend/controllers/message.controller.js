import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const getConversationKey = (userA, userB) =>
  [String(userA), String(userB)].sort().join("_");

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name username profilePicture headline")
      .populate({
        path: "lastMessage",
        populate: [
          { path: "sender", select: "name username profilePicture" },
          { path: "recipient", select: "name username profilePicture" },
        ],
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findById(userId).select(
      "name username profilePicture headline",
    );
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const participantKey = getConversationKey(req.user._id, userId);
    let conversation = await Conversation.findOne({ participantKey });

    if (!conversation) {
      conversation = await Conversation.create({
        participantKey,
        participants: [req.user._id, userId],
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name username profilePicture")
      .populate("recipient", "name username profilePicture")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: req.user._id,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      },
    );

    await Notification.updateMany(
      {
        recipient: req.user._id,
        type: "message",
        relatedUser: otherUser._id,
        read: false,
      },
      { $set: { read: true } },
    );

    res.status(200).json({ conversation, otherUser, messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const recipient = await User.findById(userId).select(
      "name username profilePicture headline",
    );
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const participantKey = getConversationKey(req.user._id, userId);
    let conversation = await Conversation.findOne({ participantKey });

    if (!conversation) {
      conversation = await Conversation.create({
        participantKey,
        participants: [req.user._id, userId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipient: userId,
      content: content.trim(),
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username profilePicture")
      .populate("recipient", "name username profilePicture");

    await Notification.create({
      recipient: userId,
      type: "message",
      relatedUser: req.user._id,
      relatedMessage: message._id,
      relatedConversation: conversation._id,
    });

    res.status(201).json({ message: populatedMessage, conversation });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

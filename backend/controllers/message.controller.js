import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    // Validate users
    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);
    if (!senderUser || !receiverUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Enforce mutual follow: both must follow each other
    const senderFollowsReceiver = (senderUser.following || []).map(String).includes(String(receiverId));
    const receiverFollowsSender = (receiverUser.following || []).map(String).includes(String(senderId));
    if (!senderFollowsReceiver || !receiverFollowsSender) {
      return res.status(403).json({
        success: false,
        message: "You can only message users who you follow and who follow you back."
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    if (newMessage) conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // Populate sender info for client
    const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'username profilePicture');

    // Real-time: emit to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', populatedMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage: populatedMessage
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    // Validate users
    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);
    if (!senderUser || !receiverUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Enforce mutual follow
    const senderFollowsReceiver = (senderUser.following || []).map(String).includes(String(receiverId));
    const receiverFollowsSender = (receiverUser.following || []).map(String).includes(String(senderId));
    if (!senderFollowsReceiver || !receiverFollowsSender) {
      return res.status(403).json({
        success: false,
        message: "You can only view messages with users who you follow and who follow you back."
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate({
      path: 'messages',
      populate: { path: 'senderId', select: 'username profilePicture' }
    });

    if (!conversation) return res.status(200).json({ success: true, messages: [] });

    return res.status(200).json({ success: true, messages: conversation.messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
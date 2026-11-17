import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  roomId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  senderRole: { type: String, default: 'Partner' },
  text: { type: String, required: true },
  type: { type: String, default: 'text' },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false,
  versionKey: false
});

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;

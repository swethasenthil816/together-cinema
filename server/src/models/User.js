import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  partnerNickname: { type: String, default: 'My Darling ❤️' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false,
  versionKey: false
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser, updateUser, readStore } from '../utils/dataStore.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'together_cinema_super_secret_romantic_key_2026';
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn: '30d' }
  );
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, avatar, partnerNickname } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = createUser({
      name,
      email,
      passwordHash,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      partnerNickname: partnerNickname || 'My Darling ❤️'
    });

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Account created successfully',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Logged in successfully',
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, partnerNickname } = req.body;
    const updated = updateUser(req.user.id, {
      ...(name && { name }),
      ...(avatar && { avatar }),
      ...(partnerNickname && { partnerNickname })
    });
    res.json({ message: 'Profile updated', user: sanitizeUser(updated) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Convenient demo login for quick 2-person testing
export const demoLogin = (req, res) => {
  const { role } = req.query; // 'partner1' or 'partner2'
  const store = readStore();
  const demoEmail = role === 'partner2' ? 'partner2@cinema.com' : 'partner1@cinema.com';
  let user = store.users.find(u => u.email === demoEmail);
  if (!user && store.users.length > 0) {
    user = store.users[0];
  }

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken(user);
  res.json({
    message: `Logged in as demo ${user.name}`,
    user: sanitizeUser(user),
    token
  });
};

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      })
      .parse(req.body);

    const existing = await User.findOne({ email: body.email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({
      email: body.email,
      passwordHash,
      name: body.name || '',
      role: 'user',
    });

    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.json({
      user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.json({
      user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(1) }).parse(req.body);

    const payload = verifyRefreshToken(body.refreshToken);
    const user = await User.findById(payload.sub);
    if (!user?.refreshTokenHash) return res.status(401).json({ message: 'Unauthorized' });

    const ok = await bcrypt.compare(body.refreshToken, user.refreshTokenHash);
    if (!ok) return res.status(401).json({ message: 'Unauthorized' });

    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const body = z.object({ userId: z.string().min(1) }).parse(req.body);
    await User.updateOne({ _id: body.userId }, { $set: { refreshTokenHash: null } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;

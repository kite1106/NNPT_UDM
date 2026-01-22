import jwt from 'jsonwebtoken';

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, mustGetEnv('JWT_ACCESS_SECRET'), {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, mustGetEnv('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, mustGetEnv('JWT_ACCESS_SECRET'));
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, mustGetEnv('JWT_REFRESH_SECRET'));
}

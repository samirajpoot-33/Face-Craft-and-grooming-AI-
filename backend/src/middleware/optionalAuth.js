/**
 * Optional JWT auth — attaches req.user when token is valid; never blocks guests
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
      next();
    });
  } catch {
    next();
  }
};

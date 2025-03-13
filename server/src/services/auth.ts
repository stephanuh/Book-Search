import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export const authenticateToken = ({ req }: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if(req.headers.authorization){
    token = token.split(' ').pop().trim();
  }
  if(!token){
    console.log('No token found');
    return { user: null };
  }
  try {
    const decodedUser: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '1h' });
    return { user: decodedUser };
  } catch (err) {
    console.log('Invalid token ❌',err);
    return { user: null };
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}
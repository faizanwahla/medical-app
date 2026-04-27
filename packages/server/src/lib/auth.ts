import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface JWTPayload {
  userId: string;
  email: string;
  specialty?: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export const generateAccessToken = (userId: string, email: string, role: string, specialty?: string): string => {
  return jwt.sign({ userId, email, role, specialty }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, email: string, role: string, specialty?: string): string => {
  return jwt.sign({ userId, email, role, specialty }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

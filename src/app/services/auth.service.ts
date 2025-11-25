import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

// Ensure your environment variables are set, or provide defaults
const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRE: StringValue = (process.env.ACCESS_TOKEN_EXPIRE ?? "1h") as StringValue;

const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET!;
const REFRESH_TOKEN_EXPIRE: StringValue = (process.env.REFRESH_TOKEN_EXPIRE ?? "7d") as StringValue;

// Hash password
export const hashPassword = async (password: string) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate Access Token
export const generateAccessToken = (userId: string) => {
    const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRE };
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, options);
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string) => {
    const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRE };
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, options);
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
        return null;
    }
};

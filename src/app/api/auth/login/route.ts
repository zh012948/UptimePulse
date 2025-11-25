import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import User from "../../../models/user.model";
import { comparePassword, generateAccessToken, generateRefreshToken } from "../../../services/auth.service";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();
        if (!email || !password)
            return NextResponse.json({ message: "Email and password required" }, { status: 400 });

        const user = await User.findOne({ email });
        if (!user)
            return NextResponse.json({ message: "Invalid email or password" }, { status: 404 });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch)
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        const res = NextResponse.json({
            message: "Logged in successfully",
            accessToken,
            user: { id: user._id, name: user.name, email: user.email }
        });

        res.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60
        });

        return res;
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

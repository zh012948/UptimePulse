import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "../../../services/auth.service";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("refreshToken")?.value;
        if (!token) return NextResponse.json({ message: "Refresh token missing" }, { status: 401 });

        const decoded: any = verifyRefreshToken(token);
        if (!decoded) return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });

        const newAccessToken = generateAccessToken(decoded.userId);
        return NextResponse.json({ accessToken: newAccessToken });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

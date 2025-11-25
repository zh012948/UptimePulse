import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import URL from "../../../models/url.model";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const userId = req.nextUrl.searchParams.get("userId");
        if (!userId) return NextResponse.json({ message: "userId required" }, { status: 400 });

        const urls = await URL.find({ userId });
        return NextResponse.json({ urls, count: urls.length });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}

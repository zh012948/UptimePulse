import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import URL from "../../../models/url.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, name, url, endpoint } = await req.json();

        if (!userId || !name || !url)
            return NextResponse.json({ message: "userId, name, url required" }, { status: 400 });

        const newUrl = await URL.create({ userId, name, url, endpoint });
        return NextResponse.json({ message: "URL added successfully", url: newUrl }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}

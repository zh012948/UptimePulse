import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import URL from "../../../models/url.model";

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const { id, name, url, endpoint } = await req.json();
        if (!id) return NextResponse.json({ message: "URL id is required" }, { status: 400 });

        const updated = await URL.findByIdAndUpdate(
            id,
            { name, url, endpoint },
            { new: true, runValidators: true }
        );
        if (!updated) return NextResponse.json({ message: "URL not found" }, { status: 404 });

        return NextResponse.json({ message: "URL updated successfully", url: updated });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}

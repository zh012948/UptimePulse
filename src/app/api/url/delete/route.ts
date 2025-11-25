import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import UrlModel from "../../../models/url.model";

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const parsed = new URL(req.url);
        const id = parsed.searchParams.get("id");

        if (!id)
            return NextResponse.json({ message: "URL id is required" }, { status: 400 });

        const deleted = await UrlModel.findByIdAndDelete(id);

        if (!deleted)
            return NextResponse.json({ message: "URL not found" }, { status: 404 });

        return NextResponse.json({ message: "URL deleted successfully" });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}

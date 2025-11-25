
import { NextResponse } from "next/server";
import connectDB from "../utils/db";
import UrlModel from "../../models/url.model";

const fetchWithTimeout = async (url: string, timeout = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
};

export async function GET() {
    try {
        await connectDB();

        // Fetch all URLs from the database
        const urls = await UrlModel.find().lean();

        // Ping all URLs concurrently
        const results = await Promise.all(
            urls.map(async (api) => {
                const endpoint = api.endpoint || "/";
                const finalUrl =
                    endpoint.startsWith("/") ? `${api.url}${endpoint}` : `${api.url}/${endpoint}`;

                const start = Date.now();

                try {
                    const res = await fetchWithTimeout(finalUrl, 10000);
                    const ms = Date.now() - start;
                    const isAlive = res.status < 500;

                    await UrlModel.findByIdAndUpdate(api._id, {
                        lastStatus: isAlive ? "UP" : "DOWN",
                        lastResponseTime: ms,
                        lastPingedAt: new Date(),
                        lastError: isAlive ? null : `Server error: ${res.status}`,
                    });

                    return {
                        _id: api._id,
                        name: api.name,
                        url: api.url,
                        endpoint,
                        status: isAlive ? "UP" : "DOWN",
                        responseTime: ms,
                    };
                } catch (err: any) {
                    await UrlModel.findByIdAndUpdate(api._id, {
                        lastStatus: "DOWN",
                        lastResponseTime: null,
                        lastPingedAt: new Date(),
                        lastError: err?.name === "AbortError" ? "Timeout" : err?.message,
                    });

                    return {
                        _id: api._id,
                        name: api.name,
                        url: api.url,
                        endpoint,
                        status: "DOWN",
                        responseTime: null,
                    };
                }
            })
        );

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message, results: [] });
    }
}

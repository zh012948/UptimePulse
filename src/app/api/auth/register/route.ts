import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../utils/db";
import User from "../../../models/user.model";
import { hashPassword } from "../../../services/auth.service";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name, email, password } = await req.json();

        if (!name || !email || !password)
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });

        const hashedPassword = await hashPassword(password);
        await User.create({ name, email, password: hashedPassword });

        return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

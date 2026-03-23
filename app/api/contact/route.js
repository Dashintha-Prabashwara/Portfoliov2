import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  honeypot: z.string().optional().default(""),
});

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json({success: false, error: "Too many requests. Please try again later.", retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)}, {status: 429});
    }

    const body = await request.json();
    if (body.honeypot && body.honeypot.trim() !== "") {
      return NextResponse.json({success: false, error: "Spam detected"}, {status: 400});
    }

    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({success: false, error: "Validation failed", errors: validation.error.flatten().fieldErrors}, {status: 400});
    }

    const { name, email, message } = validation.data;
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({from: "noreply@dashintha.me", to: process.env.ADMIN_EMAIL, subject: `New Contact Form Submission from ${name}`, html: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`});
        console.log(`✅ Contact email sent to ${process.env.ADMIN_EMAIL}`);
      } catch (emailError) {
        console.warn("⚠️ Email notification failed:", emailError);
      }
    }

    return NextResponse.json({success: true, message: "Message sent successfully! I will get back to you soon.", data: {timestamp: new Date().toISOString()}}, {status: 200});
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({success: false, error: "An error occurred while processing your request. Please try again later."}, {status: 500});
  }
}

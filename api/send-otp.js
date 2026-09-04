const { db } = require("../lib/firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const transporter = require("../lib/mailer");
const { randomInt } = require("crypto");

const RATE_LIMIT_MS = 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

function documentIdFor(email) {
    return encodeURIComponent(email.toLowerCase());
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
    }

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "❌ ادخل بريداً إلكترونياً صحيحاً" });
    }

    const otpRef = db.collection("otp_codes").doc(documentIdFor(email));
    const existing = await otpRef.get();
    const lastSentAt = existing.data()?.lastSentAt?.toMillis?.() || 0;
    if (Date.now() - lastSentAt < RATE_LIMIT_MS) {
        return res.status(429).json({ error: "❌ انتظر دقيقة قبل طلب رمز جديد" });
    }

    const code = String(randomInt(100000, 1000000));
    const now = Date.now();
    await otpRef.set({
        email,
        code,
        attempts: 0,
        lastSentAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + OTP_TTL_MS)
    });

    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "رمز تسجيل الدخول إلى 0xdya",
            text: `رمز تسجيل الدخول الخاص بك هو: ${code}. الرمز صالح لمدة 10 دقائق.`,
            html: `<div dir="rtl" lang="ar" style="font-family:Arial,sans-serif;line-height:1.8;text-align:right"><h2>رمز تسجيل الدخول</h2><p>رمزك لموقع 0xdya هو:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center">${code}</p><p>الرمز صالح لمدة 10 دقائق ولا تشاركه مع أي شخص.</p></div>`
        });
    } catch (error) {
        await otpRef.delete();
        console.error("OTP email error:", error);
        return res.status(500).json({ error: "❌ فشل إرسال الرسالة" });
    }

    return res.status(200).json({ message: "✅ تم إرسال الرمز إلى بريدك الإلكتروني" });
};

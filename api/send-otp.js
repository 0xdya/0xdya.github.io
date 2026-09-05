const { db } = require("../lib/firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const transporter = require("../lib/mailer");
const { randomInt, createHash } = require("crypto");

const RATE_LIMIT_MS = 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ALLOWED_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "proton.me",
    "protonmail.com",
    "pm.me",
    "outlook.com",
    "yahoo.com"
]);

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function documentIdFor(email) {
    return encodeURIComponent(normalizeEmail(email));
}

function hashOTP(code) {
    return createHash("sha256")
        .update(code)
        .digest("hex");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAllowedEmailDomain(email) {
    const domain = email.split("@")[1];
    return ALLOWED_EMAIL_DOMAINS.has(domain);
}

function buildOtpEmail(code) {
    return {
        subject: "رمز تسجيل الدخول إلى 0xdya",

        text: `رمز تسجيل الدخول إلى 0xdya

رمز التحقق الخاص بك هو:

${code}

هذا الرمز صالح لمدة 10 دقائق.

لا تشارك هذا الرمز مع أي شخص.

إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة.`,

        html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>رمز تسجيل الدخول إلى 0xdya</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f6f6f6;
    font-family:Arial,Helvetica,sans-serif;
    color:#111111;
">

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f6f6f6;"
>
    <tr>
        <td align="center" style="padding:32px 16px;">

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    max-width:480px;
                    background:#ffffff;
                    border:1px solid #e5e5e5;
                    border-radius:8px;
                "
            >

                <tr>
                    <td style="
                        padding:28px 28px 20px;
                        text-align:right;
                    ">
                        <div style="
                            font-size:20px;
                            font-weight:700;
                            color:#111111;
                        ">
                        رمز تسجيل الدخول
                        </div>
                    </td>
                </tr>

                <tr>
                    <td style="
                        padding:8px 28px 32px;
                        text-align:right;
                    ">

                        <p style="
                            margin:0 0 24px;
                            font-size:15px;
                            line-height:1.8;
                            color:#555555;
                        ">
                            استخدم الرمز التالي لإكمال تسجيل الدخول إلى حسابك:
                        </p>

                        <div style="
                            margin:0 0 24px;
                            padding:18px;
                            background:#f7f7f7;
                            border:1px solid #e5e5e5;
                            border-radius:8px;
                            text-align:center;
                            direction:ltr;
                        ">
                            <span style="
                                font-size:30px;
                                font-weight:700;
                                letter-spacing:7px;
                                color:#111111;
                            ">
                                ${code}
                            </span>
                        </div>

                        <p style="
                            margin:0 0 8px;
                            font-size:14px;
                            line-height:1.7;
                            color:#555555;
                        ">
                            الرمز صالح لمدة <strong>10 دقائق</strong>.
                        </p>

                        <p style="
                            margin:0;
                            font-size:14px;
                            line-height:1.7;
                            color:#777777;
                        ">
                            لا تشارك هذا الرمز مع أي شخص.
                        </p>

                    </td>
                </tr>

                <tr>
                    <td style="
                        padding:20px 28px;
                        border-top:1px solid #eeeeee;
                    ">
                        <p style="
                            margin:0;
                            font-size:12px;
                            line-height:1.7;
                            color:#999999;
                            direction: rtl;
                            text-align: right;
                        ">
                            إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة.
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>`
    };
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "الطريقة غير مسموحة"
        });
    }

    const email =
        typeof req.body?.email === "string"
            ? normalizeEmail(req.body.email)
            : "";

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({
            error: "يرجى إدخال بريد إلكتروني صحيح"
        });
    }

    if (!isAllowedEmailDomain(email)) {
        return res.status(400).json({
            error: "مسموح فقط ببريد Gmail أو Proton أو Outlook أو Yahoo"
        });
    }

    const otpRef = db
        .collection("otp_codes")
        .doc(documentIdFor(email));

    try {
        const existing = await otpRef.get();

        const data = existing.exists ? existing.data() : null;
        const lastSentAt = data?.lastSentAt?.toMillis?.() || 0;

        if (Date.now() - lastSentAt < RATE_LIMIT_MS) {
            return res.status(429).json({
                error: "يرجى الانتظار دقيقة قبل طلب رمز جديد"
            });
        }

        const code = String(randomInt(100000, 1000000));

        const now = Date.now();

        await otpRef.set({
            email,
            codeHash: hashOTP(code),
            attempts: 0,
            createdAt: Timestamp.fromMillis(now),
            lastSentAt: Timestamp.fromMillis(now),
            expiresAt: Timestamp.fromMillis(now + OTP_TTL_MS)
        });

        const emailContent = buildOtpEmail(code);

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        });

        return res.status(200).json({
            message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
        });

    } catch (error) {
        console.error("OTP request error:", error);

        try {
            await otpRef.delete();
        } catch (deleteError) {
            console.error("Failed to clean up OTP:", deleteError);
        }

        return res.status(500).json({
            error: "تعذر إرسال رمز التحقق. حاول مرة أخرى لاحقًا."
        });
    }
};

const { authAdmin, db } = require("../lib/firebase-admin");
const { createHash } = require("crypto");

const MAX_ATTEMPTS = 5;

function documentIdFor(email) {
    return encodeURIComponent(email.toLowerCase());
}

function hashOTP(code) {
    return createHash("sha256").update(code).digest("hex");
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "🛇 الطريقة غير مسموحة" });
    }

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ error: "🛇 البريد أو الرمز غير صحيح" });
    }

    const otpRef = db.collection("otp_codes").doc(documentIdFor(email));
    try {
        const verificationResult = await db.runTransaction(async transaction => {
            const snapshot = await transaction.get(otpRef);
            const data = snapshot.data();
            const attempts = data?.attempts || 0;
            const expiresAt = data?.expiresAt?.toMillis?.() || 0;
            const inputHash = hashOTP(code);

            if (!data || expiresAt <= Date.now()) {
                return "expired";
            }
            if (attempts >= MAX_ATTEMPTS) {
                return "attempts";
            }
            if (data.codeHash !== inputHash) {
                transaction.update(otpRef, { attempts: attempts + 1 });
                return "invalid";
            }

            transaction.delete(otpRef);
            return "verified";
        });

        if (verificationResult !== "verified") {
            throw new Error(verificationResult);
        }

        let user;
        try {
            user = await authAdmin.getUserByEmail(email);
        } catch (error) {
            if (error.code !== "auth/user-not-found") throw error;
            user = await authAdmin.createUser({ email, emailVerified: true });
        }

        const token = await authAdmin.createCustomToken(user.uid);
        return res.status(200).json({ token });
    } catch (error) {
        if (["expired", "attempts", "invalid"].includes(error.message)) {
            const messages = {
                expired: "🛇 انتهت صلاحية الرمز، اطلب رمزاً جديداً",
                attempts: "🛇 تجاوزت الحد الأقصى للمحاولات، اطلب رمزاً جديداً",
                invalid: "... الرمز غير صحيح"
            };
            return res.status(400).json({ error: messages[error.message] });
        }

        console.error("OTP verification error:", error);
        return res.status(500).json({ error: "<3 فشل التحقق من الرمز" });
    }
};

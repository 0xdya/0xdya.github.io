const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const firebaseApp = getApps()[0] || (() => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyValue = process.env.FIREBASE_PRIVATE_KEY;
    const missingVariables = [];

    if (!projectId) missingVariables.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missingVariables.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKeyValue) missingVariables.push("FIREBASE_PRIVATE_KEY");

    if (missingVariables.length > 0) {
        throw new Error(`Missing Firebase Admin environment variable(s): ${missingVariables.join(", ")}`);
    }

    const privateKey = privateKeyValue.replace(/\\n/g, "\n");

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey
        })
    });
})();

const authAdmin = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

module.exports = { authAdmin, db };

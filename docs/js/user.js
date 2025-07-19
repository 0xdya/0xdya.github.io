// user.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// 📦 إعداد Firebase
const app = initializeApp({
  apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
  authDomain: "oxdyaa.firebaseapp.com",
  projectId: "oxdyaa",
  storageBucket: "oxdyaa.appspot.com",
  messagingSenderId: "604062703590",
  appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
});

const auth = getAuth(app);
const db = getFirestore(app);

// 📥 تنفيذ عند دخول المستخدم
document.addEventListener("DOMContentLoaded", () => {
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const login_txt = document.getElementById("login_txt");

  onAuthStateChanged(auth, async user => {
    if (user) {
      await user.reload();

      // 👤 تحديث الواجهة
      if (userAvatar) {
        loginIcon.style.display = "none";
        userAvatar.src = user.photoURL;
        userAvatar.title = user.displayName || user.email || "حساب المستخدم";
        userAvatar.style.display = "inline-block";
        userAvatar.style.verticalAlign = "middle";
        userAvatar.style.borderRadius = "50%";
        userAvatar.style.width = "32px";
        userAvatar.style.height = "32px";
        userAvatar.style.margin = "4px 8px 4px 10px";
        userAvatar.style.objectFit = "cover";
        userAvatar.style.marginInlineEnd = "8px";
      }

      if (userName) {
        userName.textContent = user.displayName || "مستخدم";
      }

      // 🔁 تحديث بيانات Firestore
      const userRef = doc(db, "users", user.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // ✅ تحديث lastLogin
          await updateDoc(userRef, {
            lastLogin: serverTimestamp()
          });
          console.log("✅ تم تحديث lastLogin بنجاح");

          // ✅ تحديث photo إن تغيّرت
          if (user.photo && user.photo !== userData.photo) {
            await updateDoc(userRef, {
              photo: user.photoURL
            });
            console.log("✅ تم تحديث صورة الحساب");
          }
        } else {
          loginIcon.style.display = "none";
          console.warn("⚠️ لم يتم العثور على وثيقة المستخدم");
        }
      } catch (error) {
        console.error("❌ خطأ أثناء تحديث بيانات Firestore:", error);
      }
    } else {
      loginIcon.style.display = "inline-block";
      // 🚫 لم يتم تسجيل الدخول
      if (userAvatar) userAvatar.style.display = "none";
      if (userName) userName.textContent = "";
    }
  });

  // ⏱️ تحديث احتياطي في حال فشل `onAuthStateChanged`
  setTimeout(async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        console.log("⏱️ تم تحديث lastLogin من النسخة الاحتياطية");
      } catch (error) {
        console.error("❌ خطأ في النسخة الاحتياطية:", error);
      }
    }
  }, 2000);
});

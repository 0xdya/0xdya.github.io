  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
  import {
    getAuth,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

  // إعداد Firebase (مرة واحدة فقط)
  const firebaseConfig = {
    apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
    authDomain: "oxdyaa.firebaseapp.com",
    projectId: "oxdyaa",
    storageBucket: "oxdyaa.appspot.com",
    messagingSenderId: "604062703590",
    appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // دالة timeAgo
  function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `joined before ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `joined before ${hours}h`;
    const days = Math.floor(hours / 24);
    return `joined before ${days}d`;
  }

  // عرض المستخدمين
  function loadUsers() {
    const usersDiv = document.getElementById("users");
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
      usersDiv.innerHTML = "";
      snapshot.forEach(docSnap => {
        const user = docSnap.data();
        const created = user.createdAt?.toDate?.();
        const joinedText = created ? ` ${timeAgo(created)}` : "—";
        const role = user.role || "user";
        const roleClass = `role ${role}`;
        const name = user.name || "بدون اسم";
        const photo = user.photo || "../img/user.jpg";

        usersDiv.innerHTML += `
          <div class="user-card" onclick="location.href='https://0xdya.vercel.app/@${encodeURIComponent(name)}'">
            <img src="${photo}" alt="صورة المستخدم">
            <div class="name_and_role">
              <span>${name}</span>
              <div class="rotba">role: <span class="${roleClass}">${role}</span></div>
            </div>
            <div class="joined">${joinedText}</div>
          </div>
        `;
      });
    });
  }

  // تنفيذ عند تحميل الصفحة
  document.addEventListener("DOMContentLoaded", () => {
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");
    const loginIcon = document.getElementById("loginIcon");

    // تحميل قائمة المستخدمين
    loadUsers();

    // التحقق من حالة تسجيل الدخول
    onAuthStateChanged(auth, async user => {
      if (user) {
        await user.reload();

        // تحديث الواجهة
        if (loginIcon) loginIcon.style.display = "none";
        if (userAvatar) {
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

        // تحديث Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            await updateDoc(userRef, { lastLogin: serverTimestamp() });
            
            const userData = userSnap.data();
            if (user.photoURL && user.photoURL !== userData.photo) {
              await updateDoc(userRef, { photo: user.photoURL });
            }
          }
        } catch (error) {
          console.error("❌ خطأ في تحديث Firestore:", error);
        }
      } else {
        // غير مسجل دخول
        if (loginIcon) loginIcon.style.display = "inline-block";
        if (userAvatar) userAvatar.style.display = "none";
        if (userName) userName.textContent = "";
      }
    });

    // نسخة احتياطية
    setTimeout(async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userRef, { lastLogin: serverTimestamp() });
        } catch (error) {
          console.error("❌ خطأ في النسخة الاحتياطية:", error);
        }
      }
    }, 2000);
  });

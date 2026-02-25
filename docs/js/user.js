import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
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

const CACHE_KEY = "userData";
const UPDATE_INTERVAL = 10 * 60 * 1000; 

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

function applyUserUI(photo, name, email) {
  const userAvatar = document.getElementById("userAvatar");
  const loginIcon = document.getElementById("loginIcon");
  const userName = document.getElementById("userName");

  if (loginIcon) loginIcon.style.display = "none";
  if (userAvatar) {
    userAvatar.src = photo || "../img/user.jpg";
    userAvatar.title = name || email || "حساب المستخدم";
    userAvatar.style.display = "inline-block";
    userAvatar.style.verticalAlign = "middle";
    userAvatar.style.borderRadius = "50%";
    userAvatar.style.width = "24px";
    userAvatar.style.height = "24px";
    userAvatar.style.margin = "6px 10px";
    userAvatar.style.objectFit = "cover";
  }
  if (userName) userName.textContent = name || "مستخدم";
}

function loadUsers() {
  const usersDiv = document.getElementById("users");
  if (!usersDiv) return;
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

document.addEventListener("DOMContentLoaded", () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    applyUserUI(data.photo, data.name, data.email);
  }

  loadUsers();

  onAuthStateChanged(auth, async user => {
    if (user) {
      const now = Date.now();
      const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");

      applyUserUI(user.photoURL, user.displayName, user.email);

      if (now - (cachedData.lastUpdate || 0) > UPDATE_INTERVAL) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const updates = { lastLogin: serverTimestamp() };
            if (user.photoURL && user.photoURL !== userSnap.data().photo) {
              updates.photo = user.photoURL;
            }
            await updateDoc(userRef, updates);
          }

          localStorage.setItem(CACHE_KEY, JSON.stringify({
            photo: user.photoURL,
            name: user.displayName,
            email: user.email,
            lastUpdate: now
          }));

        } catch (error) {
          console.error("❌ خطأ في Firestore:", error);
        }
      }

    } else {
      localStorage.removeItem(CACHE_KEY);
      const userAvatar = document.getElementById("userAvatar");
      const loginIcon = document.getElementById("loginIcon");
      const userName = document.getElementById("userName");
      if (loginIcon) loginIcon.style.display = "inline-block";
      if (userAvatar) userAvatar.style.display = "none";
      if (userName) userName.textContent = "";
    }
  });
});
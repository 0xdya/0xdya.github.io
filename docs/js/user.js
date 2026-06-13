import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
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

function applyUserUI(photoURL) {
  const container = document.getElementById("userPhotoContainer");
  if (!container) return;

  container.innerHTML = "";

  const link = document.createElement("a");
  link.className = "nav-item";

  if (photoURL) {
    link.classList.add("user_photo_href");
    link.href = "https://0xdya.vercel.app/profile/";

    const img = document.createElement("img");
    img.src = typeof photoURL === "string" ? photoURL : "../img/user.jpg";
    img.alt = "Profile";

    const span = document.createElement("span");
    span.className = "nav-text";
    span.textContent = "Profile";

    link.appendChild(img);
    link.appendChild(span);
  } else {
    link.href = "https://0xdya.vercel.app/login/";
    link.innerHTML = `
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span class="nav-text">Sign-In</span>
    `;
  }

  container.appendChild(link);
}

document.addEventListener("DOMContentLoaded", () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    applyUserUI(data.photo);
  } else {
    applyUserUI(null);
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const now = Date.now();
      const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");

      applyUserUI(user.photoURL);

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
            lastUpdate: now
          }));

        } catch (error) {
          console.error("❌ Error updating user status:", error);
        }
      }
    } else {
      localStorage.removeItem(CACHE_KEY);
      applyUserUI(null);
    }
  });
});
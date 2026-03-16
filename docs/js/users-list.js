import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getFirestore, collection, doc, getDoc, updateDoc,
    serverTimestamp, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged
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

let allUsers = [];
let activeRole = "all";
let searchQuery = "";

function timeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m `;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h `;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d `;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}m`;
    const y = Math.floor(mo / 12);
    return `${y}y ago`;
}

function render() {
    const usersDiv = document.getElementById("users");
    const badge = document.getElementById("countBadge");

    let filtered = allUsers;
    if (activeRole !== "all") filtered = filtered.filter(u => (u.role || "user") === activeRole);
    if (searchQuery) filtered = filtered.filter(u => (u.name || "").toLowerCase().includes(searchQuery));

    badge.textContent = filtered.length;

    if (!filtered.length) {
        usersDiv.innerHTML = `<div class="empty-state">
      <ion-icon name="people-outline"></ion-icon>
      No users found
    </div>`;
        return;
    }

    usersDiv.innerHTML = filtered.map((user, i) => {
        const created = user.createdAt?.toDate?.();
        const joinedText = created ? timeAgo(created) : "—";
        const role = user.role || "user";
        const name = user.name || "No name";
        const photo = user.photo || "../img/user.jpg";
        return `
      <div class="user-card" style="animation-delay:${i * 30}ms"
           onclick="location.href='https://0xdya.vercel.app/profile/?user=${encodeURIComponent(name)}'">
        <img src="${photo}" alt="${name}" onerror="this.src='../img/user.jpg'">
        <div class="name_and_role">
          <span>${name}</span>
          <div class="rotba">role: <span class="role ${role}">${role}</span></div>
        </div>
        <div class="joined">${joinedText}</div>
      </div>`;
    }).join("");
}

function showSkeleton() {
    const usersDiv = document.getElementById("users");
    usersDiv.innerHTML = Array.from({ length: 8 }, () => `
    <div class="skeleton-card">
      <div class="sk" style="width:42px;height:42px;border-radius:8px;flex-shrink:0"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px">
        <div class="sk" style="height:13px;width:${100 + Math.random() * 80 | 0}px"></div>
        <div class="sk" style="height:11px;width:70px"></div>
      </div>
    </div>`).join("");
}

function loadUsers() {
    showSkeleton();
    const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
    onSnapshot(q, snap => {
        allUsers = snap.docs.map(d => d.data());
        render();
    });
}

function applyUserUI(photo, name) {
    const container = document.getElementById("userPhotoContainer");
    if (!container) return;
    if (name || photo) {
        container.innerHTML = `
      <a class="user_photo_href" href="https://0xdya.vercel.app/profile/" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--border);">
        <img src="${photo || '../img/user.jpg'}" style="width:28px;height:28px;border-radius:6px;object-fit:cover;">
      </a>`;
    } else {
        container.innerHTML = `
      <a href="https://0xdya.vercel.app/login/" class="icon-btn" title="Account">
        <ion-icon name="person-outline"></ion-icon>
      </a>`;
    }
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeRole = btn.dataset.role;
        render();
    });
});

document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value.trim().toLowerCase();
    render();
});

document.addEventListener("DOMContentLoaded", () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached);
        applyUserUI(data.photo, data.name);
    }

    loadUsers();

    onAuthStateChanged(auth, async user => {
        if (user) {
            applyUserUI(user.photoURL, user.displayName);
            const now = Date.now();
            const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
            if (now - (cachedData.lastUpdate || 0) > UPDATE_INTERVAL) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const updates = { lastLogin: serverTimestamp() };
                        if (user.photoURL && user.photoURL !== userSnap.data().photo) updates.photo = user.photoURL;
                        await updateDoc(userRef, updates);
                    }
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        photo: user.photoURL, name: user.displayName,
                        email: user.email, lastUpdate: now
                    }));
                } catch (e) { console.error(e); }
            }
        } else {
            localStorage.removeItem(CACHE_KEY);
            applyUserUI(null, null);
        }
    });
});

const btn = document.getElementById("back_to_top");
window.addEventListener("scroll", () => btn.classList.toggle("visible", scrollY > 400));
btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

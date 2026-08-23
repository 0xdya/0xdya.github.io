import {initializeApp} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    getCountFromServer,
    query,
    orderBy,
    onSnapshot,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {getDatabase, ref, get, runTransaction} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

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
const rtdb = getDatabase(app);
const auth = getAuth(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Persistence failed: Multiple tabs open");
    } else if (err.code == 'unimplemented') {
        console.warn("Persistence not supported");
    }
});

const CACHE_KEY = "userData";
const UPDATE_INTERVAL = 10 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

let allUsers = [];
let activeRole = "all";
let searchQuery = "";

function applyUserUI(photoURL, name) {
    const container = document.getElementById("userPhotoContainer");
    if (! container) 
        return;

    const navbars = document.querySelectorAll(".navbar");
    const navbar = navbars[1]; 
    if (navbar) {
        if (photoURL || name) {
            navbar.classList.add("nav-logged");
            console.log("(غي باش نتاكد) تم إضافة nav-logged");
        } else {
            navbar.classList.remove("nav-logged");
            console.log(" تم إزالة nav-logged");
        }
    } else {
        console.warn(" النافبار الثاني غير موجود");
    }

    container.innerHTML = "";

    if (photoURL || name) {
        const link = document.createElement("a");
        link.className = "nav-item user_photo_href";
        link.href = "https://0xdya.vercel.app/profile/";
        link.style.display = "flex";
        link.style.alignItems = "center";
        link.style.justifyContent = "center";

        const img = document.createElement("img");
        img.src = photoURL || "../img/user.jpg";
        img.alt = "البروفايل";
        img.style.width = "28px";
        img.style.height = "28px";
        img.style.borderRadius = "6px";
        img.style.objectFit = "cover";

        const span = document.createElement("span");
        span.className = "nav-text";
        span.textContent = "البروفايل";

        link.appendChild(img);
        link.appendChild(span);
        container.appendChild(link);
    } else {
        const link = document.createElement("a");
        link.className = "nav-item";
        link.href = "https://0xdya.vercel.app/login/";
        link.innerHTML = `
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span class="nav-text">انضمام</span>
    `;
        container.appendChild(link);
    }
}

async function initVisits() {
    const visitsRef = ref(rtdb, 'visits');
    const last = localStorage.getItem('lastVisit');
    const now = Date.now();

    if (! last || now - last > ONE_DAY) {
        await runTransaction(visitsRef, (current) => (current || 0) + 1);
        localStorage.setItem('lastVisit', now);
    }
    const snapshot = await get(visitsRef);
    const count = snapshot.exists() ? snapshot.val() : 0;
    const counterEl = document.getElementById("counter");
    if (counterEl) 
        counterEl.innerText = count.toLocaleString('en-US');
    
}

async function fetchCounts() {
    try {
        const [usersSnap, commentsSnap] = await Promise.all([
            getCountFromServer(collection(db, "users")),
            getCountFromServer(collection(db, "comments"))
        ]);

        const usersCountEl = document.getElementById("users_count");
        if (usersCountEl) 
            usersCountEl.innerText = usersSnap.data().count.toLocaleString('en-US');
        

        const commentsCountEl = document.getElementById("comments_count");
        if (commentsCountEl) 
            commentsCountEl.innerText = commentsSnap.data().count.toLocaleString('en-US');
        
    } catch (error) {
        console.error("Error fetching counts:", error);
    }
}

async function fetchLastLogin(userId) {
    try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (! userSnap.exists()) 
            return;
        

        const lastLogin = userSnap.data().lastLogin;
        if (! lastLogin ?. toDate) 
            return;
        

        const loginDate = lastLogin.toDate();
        const diffSec = Math.floor((new Date() - loginDate) / 1000);
        const isOnline = diffSec < 300;

        const statusContainer = document.getElementById("lastOnlineContainer");


        if (statusContainer) {
            if (isOnline) {
                statusContainer.innerHTML = `
<div class="dot on"> </div> <p id="lastOnline" style="color:#2ecc71"> نشط الآن</p>
    `;
            } else {
                statusContainer.innerHTML = `
      نشط منذ: <span class="time-ar" id="lastOnline"></span>
    `;

                const timeElement = document.getElementById("lastOnline");

                const tzOffset = loginDate.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(loginDate - tzOffset)).toISOString().slice(0, 19);

                timeElement.setAttribute("data-date", localISOTime);

                if (typeof timeAr !== "undefined" && timeAr.init) {
                    timeAr.init();
                }
            }
        }

    } catch (error) {
        console.error("Error fetching last login:", error);
    }
}

function timeAgo(date) {
    if (! date) 
        return "—";
    
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) 
        return "just now";
    
    const m = Math.floor(s / 60);
    if (m < 60) 
        return `${m}m `;
    
    const h = Math.floor(m / 60);
    if (h < 24) 
        return `${h}h `;
    
    const d = Math.floor(h / 24);
    if (d < 30) 
        return `${d}d `;
    
    const mo = Math.floor(d / 30);
    if (mo < 12) 
        return `${mo}m`;
    
    const y = Math.floor(mo / 12);
    return `${y}y ago`;
}

function render() {
    const usersDiv = document.getElementById("users");
    const badge = document.getElementById("countBadge");
    if (! usersDiv) 
        return;
    

    let filtered = allUsers;
    if (activeRole !== "all") 
        filtered = filtered.filter(u => (u.role || "user") === activeRole);
    
    if (searchQuery) 
        filtered = filtered.filter(u => (u.name || "").toLowerCase().includes(searchQuery));
    

    if (badge) 
        badge.textContent = filtered.length;
    

    if (! filtered.length) {
        usersDiv.innerHTML = `<div class="empty-state">
      <ion-icon name="people-outline"></ion-icon>
      لا يوجد مستخدمين
    </div>`;
        return;
    }

    usersDiv.innerHTML = filtered.map((user, i) => {
        const created = user.createdAt ?. toDate ?. () || null;
        const joinedText = timeAgo(created);
        const role = user.role || "مستخدم";
        const name = user.name || "يدون اسم";
        const photo = user.photo || "../img/user.jpg";
        return `
      <div class="user-card" style="animation-delay:${
            i * 10
        }ms"
           onclick="location.href='https://0xdya.vercel.app/@${
            encodeURIComponent(name)
        }'">
        <img src="${photo}" alt="${name}" onerror="this.src='../img/user.jpg'">
        <div class="name_and_role">
          <span>${name}</span>
          <div class="rotba">الرتبة: <span class="role ${role}">${role}</span></div>
        </div>
        <div class="joined">${joinedText}</div>
      </div>`;
    }).join("");
}

function showSkeleton() {
    const usersDiv = document.getElementById("users");
    if (! usersDiv) 
        return;
    
    if (! usersDiv.innerHTML.trim()) {
        usersDiv.innerHTML = Array.from(
            {
                length: 8
            },
            () => `
        <div class="skeleton-card">
          <div class="sk" style="width:42px;height:42px;border-radius:8px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:6px">
            <div class="sk" style="height:13px;width:${
                100 + Math.random() * 80 | 0
            }px"></div>
            <div class="sk" style="height:11px;width:70px"></div>
          </div>
        </div>`
        ).join("");
    }
}

function loadUsers() {
    showSkeleton();
    const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
    onSnapshot(q, snap => {
        allUsers = snap.docs.map(d => d.data());
        render();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached);
        applyUserUI(data.photo, data.name);
    } else {
        applyUserUI(null, null);
    } initVisits();
    fetchCounts();
    loadUsers();
    fetchLastLogin("X18SfoEU7JhtQC3Xsn0o9punnI23");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            applyUserUI(user.photoURL, user.displayName);
            const now = Date.now();
            const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");

            if (now - (cachedData.lastUpdate || 0) > UPDATE_INTERVAL) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const updates = {
                            lastLogin: serverTimestamp()
                        };
                        if (user.photoURL && user.photoURL !== userSnap.data().photo) {
                            updates.photo = user.photoURL;
                        }
                        await updateDoc(userRef, updates);
                    }

                    localStorage.setItem(CACHE_KEY, JSON.stringify({photo: user.photoURL, name: user.displayName, email: user.email, lastUpdate: now}));
                } catch (error) {
                    console.error("❌ Error updating user status:", error);
                }
            }
        } else {
            localStorage.removeItem(CACHE_KEY);
            applyUserUI(null, null);
        }
    });
});

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeRole = btn.dataset.role;
        render();
    });
});

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        searchQuery = e.target.value.trim().toLowerCase();
        render();
    });
}

const topBtn = document.getElementById("back_to_top");
if (topBtn) {
    window.addEventListener("scroll", () => topBtn.classList.toggle("visible", window.scrollY > 400));
    topBtn.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));
}

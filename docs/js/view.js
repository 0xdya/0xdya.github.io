    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getCountFromServer
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
  authDomain: "oxdyaa.firebaseapp.com",
  projectId: "oxdyaa",
  storageBucket: "oxdyaa.firebasestorage.app",
  messagingSenderId: "604062703590",
  appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const firestore = getFirestore(app);

const visitsRef = ref(db, 'visits');
const last = localStorage.getItem('lastVisit');
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

async function initVisits() {
  if (!last || now - last > ONE_DAY) {
    await runTransaction(visitsRef, (current) => (current || 0) + 1);
    localStorage.setItem('lastVisit', now);
  }
  const snapshot = await get(visitsRef);
  const count = snapshot.exists() ? snapshot.val() : 0;
  document.getElementById("counter").innerText = count.toLocaleString('en-US');
}

async function fetchCounts() {
  const [usersSnap, commentsSnap] = await Promise.all([
    getCountFromServer(collection(firestore, "users")),
    getCountFromServer(collection(firestore, "comments"))
  ]);

  document.getElementById("users_count").innerText = usersSnap.data().count.toLocaleString('en-US');
  
  document.getElementById("comments_count").innerText = commentsSnap.data().count.toLocaleString('en-US');
}

initVisits();
fetchCounts();
  AOS.init({ once: true, duration: 800, easing: 'ease-in-out' });
   
async function fetchLastLogin(userId) {
  const userSnap = await getDoc(doc(firestore, "users", userId));
  if (!userSnap.exists()) return;

  const lastLogin = userSnap.data().lastLogin;
  if (!lastLogin?.toDate) return;

  const diffSec = Math.floor((new Date() - lastLogin.toDate()) / 1000);
const isOnline = diffSec < 300;

const statusHTML = isOnline 
  ? `<div class="dot on"></div> Online` 
  : `<div class="dot off"></div> last seen ${formatTimeAgo(diffSec)}`;

const statusContainer = document.getElementById("lastOnline");
statusContainer.innerHTML = statusHTML;
}

function formatTimeAgo(sec) {
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

fetchLastLogin("X18SfoEU7JhtQC3Xsn0o9punnI23");

    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import {
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
  document.getElementById("counter").innerText = `${count}`;
}

async function fetchCounts() {
  const [usersSnap, commentsSnap] = await Promise.all([
    getCountFromServer(collection(firestore, "users")),
    getCountFromServer(collection(firestore, "comments"))
  ]);

  document.getElementById("users_count").innerText = `${usersSnap.data().count}`;
  document.getElementById("comments_count").innerText = `${commentsSnap.data().count}`;
}

initVisits();
fetchCounts();
  AOS.init({ once: true, duration: 800, easing: 'ease-in-out' });
  
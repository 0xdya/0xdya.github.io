import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// إعداد Firebase
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

// --- عدد الزوار ---
const visitsRef = ref(db, 'visits');
onValue(visitsRef, (snapshot) => {
  const count = snapshot.exists() ? snapshot.val() : 0;
  document.getElementById("counter").innerText = `${count}`;
});
const last = localStorage.getItem('lastVisit');
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;
if (!last || now - last > ONE_DAY) {
  runTransaction(visitsRef, (current) => (current || 0) + 1);
  localStorage.setItem('lastVisit', now);
  document.getElementById("welcome").innerText = "أهلاً بك لأول مرة!";
}

// --- عدد المستخدمين ---
const usersRef = ref(db, 'users_count');
onValue(usersRef, (snapshot) => {
  const users = snapshot.exists() ? snapshot.val() : 0;
  document.getElementById("users_count").innerText = `${users}`;
});

// --- عدد التعليقات ---
const commentsRef = ref(db, 'comments_count');
onValue(commentsRef, (snapshot) => {
  const comments = snapshot.exists() ? snapshot.val() : 0;
  document.getElementById("comments_count").innerText = `${comments}`;
});

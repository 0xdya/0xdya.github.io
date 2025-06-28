
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

  const app = initializeApp({
    apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
    authDomain: "oxdyaa.firebaseapp.com",
    projectId: "oxdyaa",
    storageBucket: "oxdyaa.appspot.com",
    messagingSenderId: "604062703590",
    appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
  });

  const auth = getAuth(app);

  document.addEventListener("DOMContentLoaded", () => {
    const loginIcon = document.getElementById("loginIcon");
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");

    onAuthStateChanged(auth, user => {
      console.log("المستخدم:", user); // 👈 راقب هذا في Console

      if (user) {
        loginIcon.style.display = "none";
        userAvatar.src = user.photoURL || "https://0xdya.github.io/img/user.jpg";
        userAvatar.title = user.displayName || user.email || "حساب المستخدم";
        userAvatar.style.display = "inline-block";
        userAvatar.style.display = "inline-block";
userAvatar.style.verticalAlign = "middle";
userAvatar.style.borderRadius = "50%";
userAvatar.style.width = "32px";
userAvatar.style.height = "32px";
userAvatar.style.margin = "4px 8px 4px 10px";
userAvatar.style.objectFit = "cover";
userAvatar.style.marginInlineEnd = "8px";

        userName.textContent = user.displayName || "مستخدم";
      } else {
        loginIcon.style.display = "inline-block";
        userAvatar.style.display = "none";
        userName.textContent = "";
      }
    });
  });
      document.getElementById("logoutBtn").onclick = () => signOut(auth);
      
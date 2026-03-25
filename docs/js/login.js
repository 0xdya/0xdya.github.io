    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
    import {
        getAuth,
        GoogleAuthProvider,
        GithubAuthProvider,
        signInWithPopup,
        signOut,
        onAuthStateChanged,
        sendSignInLinkToEmail,
        isSignInWithEmailLink,
        signInWithEmailLink
    } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
    import {
        getFirestore,
        doc,
        setDoc,
        getDoc,
        getDocFromServer,
        updateDoc,
        collection,
        query,
        orderBy,
        onSnapshot,
        serverTimestamp
    } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
    import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

    const firebaseConfig = {
        apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
        authDomain: "oxdyaa.firebaseapp.com",
        projectId: "oxdyaa",
        storageBucket: "oxdyaa.appspot.com",
        messagingSenderId: "604062703590",
        appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const rtdb = getDatabase(app);

    const CACHE_KEY = "userData";
    const UPDATE_INTERVAL = 10 * 60 * 1000;

    const providers = {
        google: new GoogleAuthProvider(),
        github: new GithubAuthProvider()
    };

    const elements = {
        continuewith: document.getElementById("continuewith"),
        loginBtns: document.getElementById("login-buttons"),
        userSection: document.getElementById("userSection"),
        userInfo: document.getElementById("userInfo"),
        userComand: document.getElementById("userComand"),
        loginComand: document.getElementById("loginComand"),
        userName: document.getElementById("userName"),
        userPhoto: document.getElementById("userPhoto"),
        errorEl: document.getElementById("error"),
        message: document.getElementById("message"),
        loader: document.getElementById("loader"),
        emailInput: document.getElementById("emailInput"),
        userPhotoContainer: document.getElementById("userPhotoContainer")
    };

    function showLoggedIn() {
        if (elements.loginBtns) elements.loginBtns.style.display = "none";
        if (elements.continuewith) elements.continuewith.style.display = "none";
        if (elements.userSection) elements.userSection.style.display = "block";
        if (elements.userInfo) elements.userInfo.style.display = "flex";
        if (elements.userComand) elements.userComand.style.display = "block";
        if (elements.loginComand) elements.loginComand.style.display = "block";
    }

    function showLoggedOut() {
        if (elements.loginBtns) elements.loginBtns.style.display = "block";
        if (elements.continuewith) elements.continuewith.style.display = "block";
        if (elements.userSection) elements.userSection.style.display = "none";
        if (elements.userInfo) elements.userInfo.style.display = "none";
        if (elements.userComand) elements.userComand.style.display = "none";
        if (elements.loginComand) elements.loginComand.style.display = "block";
        if (elements.message) elements.message.textContent = "";
    }

    function applyUserUI(photo, name) {
        if (!elements.userPhotoContainer) return;
        if (name || photo) {
            elements.userPhotoContainer.innerHTML = `
                <a class="user_photo_href nav-item" href="https://0xdya.vercel.app/profile/">
                    <img src="${photo || '../img/user.jpg'}"> <span class="nav-text">Profile</span>
                </a>`;
        } else {
            elements.userPhotoContainer.innerHTML = `
                <a href="https://0xdya.vercel.app/login/" class="nav-item active">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span class="nav-text">Sign-In</span>
                </a>`;
        }
    }

    function timeAgo(date) {
        const seconds = Math.floor((Date.now() - date) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `joined before ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `joined before ${hours}h`;
        return `joined before ${Math.floor(hours / 24)}d`;
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
                const joinedText = created ? timeAgo(created) : "—";
                const role = user.role || "user";
                const name = user.name || "no name";
                const photo = user.photo || "../img/user.jpg";
                usersDiv.innerHTML += `
                    <div class="user-card" onclick="location.href='https://0xdya.vercel.app/@${encodeURIComponent(name)}'">
                        <img src="${photo}" alt="user photo">
                        <div class="name_and_role">
                            <span>${name}</span>
                            <div class="rotba">role: <span class="role ${role}">${role}</span></div>
                        </div>
                        <div class="joined">${joinedText}</div>
                    </div>`;
            });
        });
    }

    async function initUserData(user) {
        const userRef = doc(db, "users", user.uid);
        const defaultPhoto = user.photoURL || "https://0xdya.vercel.app/img/user.jpg";
        const defaultEmail = user.email || "";
        if (elements.userPhoto) elements.userPhoto.src = defaultPhoto;

        try {
            const snap = await getDocFromServer(userRef);
            if (!snap.exists()) {
                showUsernameModal(user, userRef, defaultPhoto, defaultEmail);
            } else {
                const savedName = snap.data().name || "user";
                if (elements.userName) elements.userName.textContent = savedName;
                await setDoc(userRef, { email: defaultEmail, photo: defaultPhoto, lastLogin: serverTimestamp() }, { merge: true });
                localStorage.setItem(CACHE_KEY, JSON.stringify({ photo: defaultPhoto, name: savedName, email: defaultEmail, lastUpdate: Date.now() }));
            }
        } catch (err) {
            console.error("Firestore error:", err);
            if (elements.errorEl) elements.errorEl.textContent = "❌ error loading profile: " + err.code;
        }
    }

    function showUsernameModal(user, userRef, defaultPhoto, defaultEmail) {
        const nameModal = document.getElementById("nameModal");
        if (!nameModal) return;
        nameModal.style.display = "flex";
        document.getElementById("saveNameBtn").onclick = async () => {
            const newName = document.getElementById("nameInput").value.trim();
            if (newName.length < 3) {
                alert("⚠️ username must be at least 3 characters");
                return;
            }
            try {
                await setDoc(userRef, {
                    uid: user.uid, name: newName, email: defaultEmail, photo: defaultPhoto,
                    createdAt: serverTimestamp(), lastLogin: serverTimestamp(), role: "user",
                    hidden: false, verified: false, bio: "", banner: "",
                    social: { github: "", twitter: "", website: "" }
                });
                await runTransaction(ref(rtdb, "users_count"), c => (c || 0) + 1);
                if (elements.userName) elements.userName.textContent = newName;
                nameModal.style.display = "none";
                alert("✅ account created successfully!");
                localStorage.setItem(CACHE_KEY, JSON.stringify({ photo: defaultPhoto, name: newName, email: defaultEmail, lastUpdate: Date.now() }));
            } catch (err) {
                alert("❌ failed to create account: " + err.code);
            }
        };
    }

    async function loginWithProvider(provider) {
        if (elements.errorEl) elements.errorEl.textContent = "";
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            if (err.code === "auth/account-exists-with-different-credential") {
                elements.errorEl.textContent = "⚠️ this email is already registered with a different provider.";
            } else if (err.code !== "auth/popup-closed-by-user") {
                elements.errorEl.textContent = "❌ login failed: " + err.code;
            }
        }
    }

    async function handleEmailLink(email) {
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            window.history.replaceState({}, document.title, window.location.pathname);
            await initUserData(result.user);
            if (elements.message) elements.message.innerHTML = "login successfully 🐧";
            showLoggedIn();
        } catch (err) {
            if (elements.errorEl) elements.errorEl.textContent = "❌ login failed: " + err.code;
            if (elements.loader) elements.loader.style.display = "none";
            showLoggedOut();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            applyUserUI(data.photo, data.name);
        } else {
            applyUserUI(null, null);
        }
        loadUsers();

        onAuthStateChanged(auth, async user => {
            if (elements.loader) elements.loader.style.display = "none";
            if (user) {
                showLoggedIn();
                applyUserUI(user.photoURL, user.displayName);
                if (elements.message) elements.message.innerHTML = "login successfully 🐧";
                
                const now = Date.now();
                const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
                if (now - (cachedData.lastUpdate || 0) > UPDATE_INTERVAL) {
                    await initUserData(user);
                }
            } else {
                showLoggedOut();
                localStorage.removeItem(CACHE_KEY);
                applyUserUI(null, null);
            }
        });

        if (isSignInWithEmailLink(auth, window.location.href)) {
            if (elements.loader) elements.loader.style.display = "flex";
            const storedEmail = window.localStorage.getItem("emailForSignIn");
            if (storedEmail) {
                handleEmailLink(storedEmail);
            } else {
                if (elements.loader) elements.loader.style.display = "none";
                const emailPromptModal = document.getElementById("emailPromptModal");
                if (emailPromptModal) emailPromptModal.style.display = "flex";
                document.getElementById("confirmEmailBtn")?.addEventListener("click", () => {
                    const enteredEmail = document.getElementById("promptEmailInput").value.trim();
                    if (enteredEmail.includes("@")) {
                        emailPromptModal.style.display = "none";
                        if (elements.loader) elements.loader.style.display = "flex";
                        handleEmailLink(enteredEmail);
                    }
                });
            }
        }

        document.getElementById("logoutBtn")?.addEventListener("click", () => signOut(auth));
        document.getElementById("googleLogin")?.addEventListener("click", () => loginWithProvider(providers.google));
        document.getElementById("githubLogin")?.addEventListener("click", () => loginWithProvider(providers.github));
        document.getElementById("sendLoginLink")?.addEventListener("click", async () => {
            const email = elements.emailInput.value.trim();
            if (!email.includes("@")) return;
            try {
                await sendSignInLinkToEmail(auth, email, { url: window.location.origin + window.location.pathname, handleCodeInApp: true });
                window.localStorage.setItem("emailForSignIn", email);
                alert("📨 link sent!");
                elements.emailInput.value = "";
            } catch (err) {
                if (elements.errorEl) elements.errorEl.textContent = "❌ " + err.code;
            }
        });
    });

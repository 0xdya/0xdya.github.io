import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getFirestore, collection, query, where, getDocs,
    doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const IMGBB_KEY = "74df1d7df65c908780380624ae8a9370";
const cfg = {
    apiKey: "AIzaSyC2U0aM8mUrYoDI0R9pYbzQZk1g9zd96O0",
    authDomain: "oxdyaa.firebaseapp.com",
    projectId: "oxdyaa",
    storageBucket: "oxdyaa.appspot.com",
    messagingSenderId: "604062703590",
    appId: "1:604062703590:web:924c0cbd8a988f4fcf8027"
};

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const urlParams = new URLSearchParams(window.location.search);
const usernameFromURL = urlParams.get("user") || "profile";

const $ = id => document.getElementById(id);
const loadingEl = $("loading");
const profileEl = $("profileContainer");
const msgBox = $("msgBox");
const currentNameEl = $("currentName");
const roleIconsEl = $("roleIcons");
const handleEl = $("handleEl");
const photoPreview = $("photoPreview");
const bannerImg = $("bannerImg");
const bannerWrap = $("bannerWrap");
const avatarWrap = $("avatarWrap");
const displayBioEl = $("displayBioInput");
const statusEl = $("statusEl");
const statusText = $("statusText");
const statJoined = $("statJoined");
const statComments = $("statComments");
const editBtn = $("editBtn");
const logoutBtn = $("logoutBtn");
const edit_section = $("edit_section");
const displayNameInput = $("displayNameInput");
const bioInput = $("bioInput");
const saveAllBtn = $("saveAllBtn");
const syncPhotoBtn = $("syncPhotoBtn");
const platformSelect = $("platformSelect");
const socialInput = $("socialUsernameInput");
const saveSocialBtn = $("saveSocialBtn");
const socialLinksDiv = $("socialLinks");
const bannerFile = $("bannerFileInput");
const avatarFile = $("avatarFileInput");
const uploadBarWrap = $("uploadBarWrap");
const uploadBar = $("uploadBar");
const uploadHint = $("uploadHint");

const showMessage = msg => {
    loadingEl.style.display = "none";
    msgBox.style.display = "block";
    msgBox.innerHTML = msg;
};
const showProfile = () => {
    loadingEl.style.display = "none";
    profileEl.style.display = "block";
};
const timeAgo = sec => {
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
};
const normSocials = raw => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object")
        return Object.entries(raw).filter(([, v]) => v).map(([p, u]) => ({ platform: p, username: u }));
    return [];
};
const socialURL = (p, u) => ({
    twitter: `https://x.com/${u}`, x: `https://x.com/${u}`,
    github: `https://github.com/${u}`, linkedin: `https://linkedin.com/in/${u}`,
    facebook: `https://facebook.com/${u}`, instagram: `https://instagram.com/${u}`,
    youtube: `https://youtube.com/@${u}`, email: `mailto:${u}`
}[p] || "#");
const socialIcon = p => ({
    twitter: "logo-twitter", x: "logo-twitter", github: "logo-github",
    linkedin: "logo-linkedin", facebook: "logo-facebook",
    instagram: "logo-instagram", youtube: "logo-youtube", email: "mail-outline"
}[p] || "link-outline");

function getRoleBadges(data) {
    let html = "";
    if (data.verified)
        html += `<img src="https://0xdya.vercel.app/badges/verf.svg" class="role-badge">`;
    if (data.role === "owner")
        html += `<img src="https://0xdya.vercel.app/badges/server-owner.svg" class="role-badge">`;
    if (data.role === "QA-tester")
        html += `<img src="https://0xdya.vercel.app/badges/bug-hunter-lv1.svg" class="role-badge">`;
    return html;
}

// ── Image compress ────────────────────────────────────────────────
function compressImage(file, maxWidth, quality) {
    return new Promise(resolve => {
        const canvas = document.createElement("canvas");
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = URL.createObjectURL(file);
    });
}

async function uploadToImgBB(file, maxWidth, quality) {
    const base64 = await compressImage(file, maxWidth, quality);
    const base64Raw = base64.split(",")[1];

    const form = new FormData();
    form.append("image", base64Raw);
    form.append("key", IMGBB_KEY);

    uploadBarWrap.style.display = "block";
    uploadBar.style.width = "40%";

    const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
    const data = await res.json();

    uploadBar.style.width = "100%";
    setTimeout(() => {
        uploadBarWrap.style.display = "none";
        uploadBar.style.width = "0%";
    }, 400);

    if (!data.success) throw new Error(data.error?.message || "ImgBB upload failed");
    return data.data.url;
}

function applyNavUI(photo, name) {
    const c = $("userPhotoContainer"); if (!c) return;
    c.innerHTML = (name || photo)
        ? `<a class="user_photo_href nav-item" href="?user=${encodeURIComponent(name || '')}"><img src="${photo || '../img/user.jpg'}"></a>`
        : `<a href="../login/" class="nav-item">
           <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
           </svg><span class="nav-text">Account</span></a>`;
}
const _c = localStorage.getItem("userData");
if (_c) { const d = JSON.parse(_c); applyNavUI(d.photo, d.name); }

displayNameInput.addEventListener("input", () => {
    displayNameInput.value = displayNameInput.value
        .replace(/\s+/g, "_").replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9_]/g, "");
});

onAuthStateChanged(auth, async user => {
    applyNavUI(user?.photoURL, user?.displayName);
    try {
        if (!user && usernameFromURL === "profile") {
            showMessage(`⚠️ please <a href='../login/' style='color:#1d9bf0'>login</a> first.`); return;
        }
        if (user && usernameFromURL === "profile") {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists() && snap.data().name) {
                window.location.replace(`?user=${encodeURIComponent(snap.data().name)}`); return;
            }
            showMessage(`⚠️ profile not set up. <a href='../login/' style='color:#1d9bf0'>go to login</a>`); return;
        }
        loadProfile(user);
    } catch (e) {
        console.error(e);
        showMessage("🚨 something went wrong.");
    }
});

function loadProfile(currentUser) {
    const q = query(collection(db, "users"), where("name", "==", usernameFromURL));
    onSnapshot(q, async qs => {
        if (qs.empty) { showMessage("🚫 user not found."); return; }

        const userDoc = qs.docs[0];
        const data = userDoc.data();
        const uid = userDoc.id;
        const isOwner = !!(currentUser && currentUser.uid === uid);

        currentNameEl.textContent = data.name || "";
        handleEl.textContent = `@${data.name || ""}`;
        displayBioEl.textContent = data.bio || "";

        if (data.banner) bannerImg.src = data.banner;
        photoPreview.src = isOwner
            ? (currentUser.photoURL || data.photo || "../img/user.jpg")
            : (data.photo || "../img/user.jpg");

        showProfile();
        roleIconsEl.innerHTML = getRoleBadges(data);

        if (data.lastLogin?.toDate) {
            const diff = Math.floor((Date.now() - data.lastLogin.toDate()) / 1000);
            statusEl.className = diff < 300 ? "online" : "";
            statusText.textContent = diff < 300 ? "online now" : `last seen ${timeAgo(diff)}`;
        }

        const created = data.createdAt?.toDate?.();
        if (created) {
            statJoined.innerHTML = `
          <ion-icon name="calendar-outline"></ion-icon>
          <span>Joined <span class="val">${MONTHS[created.getMonth()]} ${created.getFullYear()}</span></span>`;
        }

        getDocs(query(collection(db, "comments"), where("uid", "==", uid)))
            .then(snap => {
                statComments.innerHTML = `
            <ion-icon name="chatbubble-outline"></ion-icon>
            <a href="../comments/" style="color:inherit;text-decoration:none">
              comments: <span class="val">${snap.size}</span>
            </a>`;
            })
            .catch(e => console.error("comments count:", e));

        let userSocials = normSocials(data.socials);
        let sortable = null;
        let isEditing = false;

        function renderSocials() {
            socialLinksDiv.innerHTML = "";
            userSocials.forEach(({ platform, username }, i) => {
                const card = document.createElement("div");
                card.className = "link_card";
                card.setAttribute("draggable", String(isOwner));
                card.innerHTML = `
            <ion-icon name="${socialIcon(platform)}"></ion-icon>
            <a href="${socialURL(platform, username)}" target="_blank" rel="noopener"
               style="color:inherit;text-decoration:none">${username}</a>
            ${isOwner ? `<button class="del-btn" title="remove">✕</button>` : ""}`;
                if (isOwner) {
                    card.querySelector(".del-btn").onclick = async e => {
                        e.stopPropagation();
                        userSocials.splice(i, 1);
                        await setDoc(doc(db, "users", uid), { socials: userSocials }, { merge: true });
                        renderSocials(); if (isEditing) enableSorting();
                    };
                }
                socialLinksDiv.appendChild(card);
            });
        }

        function enableSorting() {
            if (sortable) sortable.destroy();
            sortable = new Sortable(socialLinksDiv, {
                animation: 150, draggable: ".link_card",
                onEnd: async ({ oldIndex, newIndex }) => {
                    if (oldIndex === newIndex) return;
                    const [m] = userSocials.splice(oldIndex, 1);
                    userSocials.splice(newIndex, 0, m);
                    await setDoc(doc(db, "users", uid), { socials: userSocials }, { merge: true });
                    renderSocials(); enableSorting();
                }
            });
        }

        renderSocials();
        if (!isOwner) return;

        editBtn.style.display = "flex";
        logoutBtn.style.display = "flex";
        bannerWrap.classList.add("owner");
        avatarWrap.classList.add("owner");

        bannerWrap.addEventListener("click", () => { bannerFile.click(); });
        avatarWrap.addEventListener("click", () => { avatarFile.click(); });

        bannerFile.addEventListener("change", async () => {
            const file = bannerFile.files[0]; if (!file) return;
            if (file.size > 10 * 1024 * 1024) { alert("❌ file too large (max 10MB)"); return; }
            try {
                saveAllBtn.disabled = true;
                const url = await uploadToImgBB(file, 1200, 0.75);
                await setDoc(doc(db, "users", uid), { banner: url }, { merge: true });
                bannerImg.src = url;
                saveAllBtn.disabled = false;
                alert("✅ banner updated!");
            } catch (e) {
                saveAllBtn.disabled = false;
                alert("❌ upload failed: " + e.message);
            } finally {
                bannerFile.value = "";
            }
        });

        avatarFile.addEventListener("change", async () => {
            const file = avatarFile.files[0]; if (!file) return;
            if (file.size > 10 * 1024 * 1024) { alert("❌ file too large (max 10MB)"); return; }
            try {
                saveAllBtn.disabled = true;
                // 300x300, 85% quality
                const url = await uploadToImgBB(file, 300, 0.85);
                await updateProfile(currentUser, { photoURL: url });
                await setDoc(doc(db, "users", uid), { photo: url }, { merge: true });
                photoPreview.src = url;
                saveAllBtn.disabled = false;
                alert("✅ avatar updated!");
            } catch (e) {
                saveAllBtn.disabled = false;
                alert("❌ upload failed: " + e.message);
            } finally {
                avatarFile.value = "";
            }
        });

        editBtn.addEventListener("click", () => {
            isEditing = !isEditing;
            edit_section.style.display = isEditing ? "block" : "none";
            editBtn.textContent = isEditing ? "✕ Close" : "Edit profile";
            displayNameInput.value = data.name || "";
            bioInput.value = data.bio || "";
            if (isEditing) enableSorting();
            else { if (sortable) { sortable.destroy(); sortable = null; } }
            renderSocials();
        });

        syncPhotoBtn.addEventListener("click", async () => {
            try {
                await currentUser.reload();
                const gp = currentUser.providerData.find(p => p.providerId === "google.com");
                if (!gp?.photoURL) { alert("❌ no Google photo found."); return; }
                await updateProfile(currentUser, { photoURL: gp.photoURL });
                await setDoc(doc(db, "users", uid), { photo: gp.photoURL }, { merge: true });
                photoPreview.src = gp.photoURL;
                alert("✅ synced!");
            } catch (e) { alert("❌ " + e.code); }
        });

        saveAllBtn.addEventListener("click", async () => {
            const newName = displayNameInput.value.trim();
            const newBio = bioInput.value.trim().slice(0, 200);
            if (!newName) { alert("⚠️ username cannot be empty."); return; }
            if (newName !== data.name) {
                const chk = await getDocs(query(collection(db, "users"), where("name", "==", newName)));
                if (!chk.empty && chk.docs[0].id !== currentUser.uid) { alert("⚠️ username taken."); return; }
            }
            try {
                saveAllBtn.disabled = true;
                saveAllBtn.textContent = "Saving...";
                await updateProfile(currentUser, { displayName: newName });
                await setDoc(doc(db, "users", uid), {
                    name: newName,
                    bio: newBio,
                    photo: currentUser.photoURL || data.photo,
                    socials: userSocials
                }, { merge: true });
                alert("✅ saved!");
                window.location.href = `?user=${encodeURIComponent(newName)}`;
            } catch (e) {
                saveAllBtn.disabled = false;
                saveAllBtn.textContent = "Save changes";
                alert("❌ " + e.code);
            }
        });

        saveSocialBtn.addEventListener("click", async () => {
            const platform = platformSelect.value;
            const username = socialInput.value.trim().replace(/^@/, "");
            if (!username) { alert("⚠️ enter a username."); return; }
            if (userSocials.find(s => s.platform === platform && s.username === username)) {
                alert("⚠️ already added."); return;
            }
            userSocials.push({ platform, username });
            await setDoc(doc(db, "users", uid), { socials: userSocials }, { merge: true });
            socialInput.value = ""; renderSocials(); if (isEditing) enableSorting();
        });

        logoutBtn.addEventListener("click", async () => {
            try { await signOut(auth); window.location.href = "../"; }
            catch (e) { console.error(e); }
        });
    });
}

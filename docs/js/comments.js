
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, deleteDoc, doc, query,
    orderBy, serverTimestamp, onSnapshot, getDocs,
    updateDoc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getDatabase, ref, increment, update } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

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
const rtdb = getDatabase(app);

const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');
const write_comment = document.getElementById('write_comment');
const alertBox = document.getElementById('alertBox');
const commentsLabel = document.getElementById('commentsLabel');
const currentUserAvatar = document.getElementById('currentUserAvatar');

let currentUser = null;
let currentUserData = null;

function showAlert(message, error = false) {
    alertBox.innerHTML = `<div style="border-left-color:${error ? '#e05c5c' : '#31a24c'}">${message}</div>`;
    setTimeout(() => alertBox.innerHTML = "", 4000);
}

function formatDate(dateValue) {
    const date = new Date(dateValue);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;

    const years = Math.floor(months / 12);
    return `${years}y`;
}

async function getUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
            const data = snap.data();
            return {
                name: data.name || "user",
                photo: data.photo || `https://0xdya.vercel.app/img/user.jpg`,
                role: data.role || null,
                verified: data.verified || false
            };
        }
    } catch (e) { }
    return { name: "user", photo: `https://0xdya.vercel.app/img/user.jpg`, verified: false };
}

const VERIFIED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>`;

function getRoleIcon(role) {
    if (role === 'owner') return `<img src="../badges/server-owner.svg" class="badge-owner">`;
    if (role === 'dev') return `<ion-icon name="code-slash-outline" style="color:violet;font-size:14px;"></ion-icon>`;
    return '';
}

async function loadReplies(commentId) {
    const repliesDiv = document.getElementById(`replies-${commentId}`);
    if (!repliesDiv) return;
    repliesDiv.innerHTML = "";

    const q = query(collection(db, "comments", commentId, "replies"), orderBy("timestamp", "asc"));
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
        const d = docSnap.data();
        const replyId = docSnap.id;
        const timeStr = formatDate(d.timestamp?.toDate() || new Date());
        const userData = await getUserData(d.uid);

        while (currentUser && currentUserData === null) {
            await new Promise(r => setTimeout(r, 50));
        }

        const isOwner = currentUser?.uid === d.uid || currentUserData?.role === "owner";

        const card = document.createElement('div');
        card.className = 'reply-card';
        card.style.display = 'flex';
        card.innerHTML = `
      <a href="https://0xdya.vercel.app/profile/?user=${userData.name}" target="_blank" style="flex-shrink:0;">
        <img src="${userData.photo}" alt="${userData.name}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid var(--border);margin-top:2px;">
      </a>
      <div style="flex:1;min-width:0;">
        <div class="reply-bubble">

         <div class="reply-author" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
<a href="https://0xdya.vercel.app/profile/?user=${userData.name}" 
 target="_blank"
 style="color:inherit;text-decoration:none;font-weight:600;font-size:.825rem;">
 ${userData.name}
</a>
${userData.verified ? VERIFIED_SVG : ''}
${getRoleIcon(userData.role)}
<span style="opacity:.6;font-size:.7rem;">· ${timeStr}</span>
</div>


          <div class="reply-text">${d.text}</div>
        </div>
        <div class="reply-meta">
          ${isOwner ? `<button class="delete-reply-btn" data-rid="${replyId}" data-cid="${commentId}">Delete</button>` : ''}
        </div>
      </div>
    `;
        repliesDiv.appendChild(card);

        if (isOwner) {
            card.querySelector('.delete-reply-btn').addEventListener('click', async () => {
                if (confirm("Delete this reply?")) {
                    await deleteDoc(doc(db, "comments", commentId, "replies", replyId));
                    await update(ref(rtdb, '/'), { comments_count: increment(-1) });
                    showAlert("Reply deleted.");
                    loadReplies(commentId);
                }
            });
        }
    }
}

function loadComments() {
    const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
    let pinned = [], normal = [];
    const loadedSet = new Set();

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            const docSnap = change.doc;
            const data = docSnap.data();
            const commentId = docSnap.id;

            if (change.type === "added") {
                if (document.getElementById(`comment-wrap-${commentId}`)) return;

                const timeStr = formatDate(data.timestamp?.toDate() || new Date());
                const userData = await getUserData(data.uid);
                const isOwner = currentUser?.uid === data.uid || currentUserData?.role === "owner";

                const wrap = document.createElement('div');
                wrap.id = `comment-wrap-${commentId}`;

                wrap.innerHTML = `
          <div class="comment-card" id="comment-${commentId}">
            <div class="comment-avatar">
              <a href="https://0xdya.vercel.app/profile/?user=${userData.name}" target="_blank">
                <img src="${userData.photo}" alt="${userData.name}">
              </a>
            </div>
            <div class="comment-body">
              ${data.pinned ? `<div class="pin-badge"><ion-icon name="push-outline"></ion-icon> Pinned comment</div>` : ''}
              <div class="comment-bubble ${data.pinned ? 'pinned' : ''}">

               <div class="bubble-author" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
<a href="https://0xdya.vercel.app/profile/?user=${userData.name}" 
 target="_blank" 
 style="color:inherit;font-weight:600;">
 ${userData.name}
</a>
${userData.verified ? VERIFIED_SVG : ''}
${getRoleIcon(userData.role)}
<span style="opacity:.6;font-size:.75rem;">· ${timeStr}</span>
</div>


                <div class="bubble-text">${data.text}</div>
              </div>
              <div class="comment-meta">
                <button class="meta-action reply-toggle-btn" data-id="${commentId}">Reply</button>
                ${isOwner ? `<button class="meta-action delete" data-id="${commentId}">Delete</button>` : ''}
              </div>
            </div>
          </div>
          <div class="reply-form-wrap" id="reply-form-${commentId}">
            <img src="${currentUser?.photoURL || 'https://0xdya.vercel.app/img/user.jpg'}" alt="">
            <div class="reply-input-row">
              <textarea placeholder="Write a reply..." class="reply-input" rows="1"></textarea>
              <button class="reply-submit-btn" data-id="${commentId}">Reply</button>
            </div>
          </div>
          <div class="replies-section" id="replies-${commentId}"></div>
        `;

                const entry = { el: wrap, id: commentId, pinned: data.pinned, timestamp: data.timestamp };
                if (data.pinned) pinned.push(entry);
                else normal.push(entry);

                wrap.querySelector('.reply-toggle-btn').addEventListener('click', () => {
                    if (!currentUser) { showAlert("Login to reply", true); return; }
                    const form = document.getElementById(`reply-form-${commentId}`);
                    form.classList.toggle('open');
                    if (form.classList.contains('open')) form.querySelector('textarea').focus();
                });

                wrap.querySelector('.reply-submit-btn').addEventListener('click', async () => {
                    const input = wrap.querySelector('.reply-input');
                    const text = input.value.trim();
                    if (!text || !currentUser) return;
                    await addDoc(collection(db, "comments", commentId, "replies"), {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        text,
                        timestamp: serverTimestamp()
                    });
                    await update(ref(rtdb, '/'), { comments_count: increment(1) });
                    input.value = "";
                    document.getElementById(`reply-form-${commentId}`).classList.remove('open');
                    loadReplies(commentId);
                });

                if (isOwner) {
                    wrap.querySelector('.delete').addEventListener('click', async () => {
                        if (confirm("Delete this comment?")) {
                            await deleteDoc(doc(db, "comments", commentId));
                            await update(ref(rtdb, '/'), { comments_count: increment(-1) });
                            showAlert("Comment deleted.");
                        }
                    });
                }

                const all = [...pinned, ...normal];
                all.sort((a, b) => {
                    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
                    return b.timestamp?.seconds - a.timestamp?.seconds;
                });

                commentsList.innerHTML = "";
                all.forEach(({ el }) => commentsList.appendChild(el));

                all.forEach(({ id }) => {
                    if (!loadedSet.has(id)) {
                        loadedSet.add(id);
                        loadReplies(id);
                    }
                });

                commentsLabel.style.display = 'block';
            }

            if (change.type === "removed") {
                const el = document.getElementById(`comment-wrap-${commentId}`);
                if (el) el.remove();
            }
        });

        commentForm.style.display = currentUser ? "block" : "none";
        write_comment.style.display = currentUser ? "none" : "block";

        const load = document.getElementById('load');
        if (load) load.remove();
    });
}

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = commentInput.value.trim();
    if (!text || !currentUser) return;
    try {
        await addDoc(collection(db, "comments"), {
            uid: currentUser.uid,
            email: currentUser.email,
            text,
            pinned: false,
            timestamp: serverTimestamp()
        });
        await update(ref(rtdb, '/'), { comments_count: increment(1) });
        commentForm.reset();
        showAlert("Comment posted!");
    } catch (err) {
        showAlert("Error posting comment.", true);
    }
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        currentUserAvatar.src = user.photoURL || 'https://0xdya.vercel.app/img/user.jpg';
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            name: user.displayName || "user",
            avatar: user.photoURL || `https://0xdya.vercel.app/img/user.jpg`
        }, { merge: true });
        try {
            const snap = await getDoc(userRef);
            if (snap.exists()) currentUserData = { role: snap.data().role || null };
        } catch (e) { }
    }
    loadComments();
});

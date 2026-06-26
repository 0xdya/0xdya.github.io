import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, deleteDoc, doc, query,
    orderBy, serverTimestamp, onSnapshot, getDocs,
    getDoc, setDoc, increment, updateDoc
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
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');
const write_comment = document.getElementById('write_comment');
const alertBox = document.getElementById('alertBox');
const commentsLabel = document.getElementById('commentsLabel');
const currentUserAvatar = document.getElementById('currentUserAvatar');
let currentUser = null;
let currentUserData = null;
let commentsUnsub = null;
let alertTimeout = null;
const userCache = new Map();

async function adjustCommentCount(uid, delta) {
    if (!uid) return;
    try {
        await updateDoc(doc(db, "users", uid), {
            commentCount: increment(delta)
        });
    } catch (e) {
        await setDoc(doc(db, "users", uid), { commentCount: increment(delta) }, { merge: true });
    }
}

function showAlert(message, error = false) {
    clearTimeout(alertTimeout);
    alertBox.innerHTML = `<div class="${error ? 'alert-error' : 'alert-success'}">${message}</div>`;
    alertTimeout = setTimeout(() => { alertBox.innerHTML = ""; }, 4000);
}

function syncReplyControls() {
    const show = !!currentUser;
    document.querySelectorAll('.reply-toggle-btn').forEach(btn => {
        btn.style.display = show ? '' : 'none';
    });
    if (!show) {
        document.querySelectorAll('.reply-form-wrap.open').forEach(f => f.classList.remove('open'));
    }
}

function formatDate(dateValue) {
    if (!dateValue) return "الآن";
    const diffSeconds = Math.floor(Math.abs(Date.now() - new Date(dateValue)) / 1000);
    if (diffSeconds < 60) return "الآن";

    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    const units = {
        year: ["سنة", "سنتين", "سنوات", "سنة"],
        month: ["شهر", "شهرين", "أشهر", "شهراً"],
        week: ["أسبوع", "أسبوعين", "أسابيع", "أسبوعاً"],
        day: ["يوم", "يومين", "أيام", "يوماً"],
        hour: ["ساعة", "ساعتين", "ساعات", "ساعة"],
        minute: ["دقيقة", "دقيقتين", "دقائق", "دقيقة"]
    };
    for (const [unit, value] of Object.entries(intervals)) {
        const count = Math.floor(diffSeconds / value);
        if (count >= 1) {
            if (count === 1) return `منذ ${units[unit][0]}`;
            if (count === 2) return `منذ ${units[unit][1]}`;
            if (count <= 10) return `منذ ${count} ${units[unit][2]}`;
            return `منذ ${count} ${units[unit][3]}`;
        }
    }
    return "الآن";
}

async function getUserData(uid) {
    if (!uid) return { name: "user", photo: "https://0xdya.vercel.app/img/user.jpg", role: null, verified: false };
    if (userCache.has(uid)) return userCache.get(uid);
    try {
        const snap = await getDoc(doc(db, "users", uid));
        const d = snap.exists() ? snap.data() : {};
        const data = {
            name: d.name || "user",
            photo: d.photo || d.avatar || "https://0xdya.vercel.app/img/user.jpg",
            role: d.role || null,
            verified: d.verified || false
        };
        userCache.set(uid, data);
        return data;
    } catch {
        return { name: "user", photo: "https://0xdya.vercel.app/img/user.jpg", role: null, verified: false };
    }
}

const VERIFIED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>`;

function getRoleIcon(role) {
    if (role === 'owner') return `<img src="../badges/server-owner.svg" class="badge-owner">`;
    if (role === 'dev') return `<ion-icon name="code-slash-outline" style="color:violet;font-size:14px;"></ion-icon>`;
    return '';
}

function escapeHtml(text = "") {
    const div = document.createElement("div");
    div.textContent = text;
    let safeHtml = div.innerHTML;

    const hasArabic = /[\u0600-\u06FF]/;
    const isArabicComment = hasArabic.test(text);

    if (isArabicComment) {
        safeHtml = safeHtml.replace(/\.{3}/g, '<span style="display: inline-block; direction: ltr; letter-spacing: 1px; margin: 0 2px;">...</span>');
        safeHtml = safeHtml.replace(/\.{2}/g, '<span style="display: inline-block; direction: ltr; letter-spacing: 1px; margin: 0 2px;">..</span>');

        const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
        safeHtml = safeHtml.replace(emojiRegex, '<span style="font-family: system-ui, -apple-system, sans-serif; display: inline-block; vertical-align: middle; margin: 0 1px; direction: ltr;">$1</span>');

        return `<span style="font-family: 'Vazirmatn', sans-serif !important; direction: rtl; display: block; font-size=5rem !important ">${safeHtml}</span>`;
    } else {
        return `<span style="font-family: 'JetBrains Mono', monospace !important; direction: ltr; display: block;">${safeHtml}</span>`;
    }
}

async function loadReplies(commentId) {
    const repliesDiv = document.getElementById(`replies-${commentId}`);
    if (!repliesDiv) return;


    repliesDiv.innerHTML = '<div style="padding:8px;text-align:center;opacity:0.6;font-size:13px;">جاري تحميل الردود...</div>';

    try {
        const snap = await getDocs(
            query(collection(db, "comments", commentId, "replies"), orderBy("timestamp", "asc"))
        );

        if (snap.empty) {
            repliesDiv.innerHTML = '';
            return;
        }

        repliesDiv.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (const docSnap of snap.docs) {
            const d = docSnap.data();
            const replyId = docSnap.id;
            const timeStr = formatDate(d.timestamp?.toDate());
            const userData = await getUserData(d.uid);
            const isOwner = currentUser?.uid === d.uid || currentUserData?.role === "owner";

            const card = document.createElement('div');
            card.className = 'reply-card';
            card.style.display = 'flex';
            card.innerHTML = `
                <a href="https://0xdya.vercel.app/@${userData.name}" target="_blank" style="flex-shrink:0;">
                    <img src="${userData.photo}" alt="${userData.name}"
                         style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid var(--border);margin-top:2px;">
                </a>
                <div style="flex:1;min-width:0;">
                    <div class="reply-bubble">
                        <div class="reply-author" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            <a href="https://0xdya.vercel.app/@${userData.name}" target="_blank"
                               style="color:inherit;text-decoration:none;font-weight:600;font-size:.825rem;">${userData.name}</a>
                            ${userData.verified ? VERIFIED_SVG : ''}
                            ${getRoleIcon(userData.role)}
                            <span style="opacity:.6;font-size:.7rem;">· ${timeStr}</span>
                        </div>
                        <div class="reply-text">${escapeHtml(d.text)}</div>
                    </div>
                    <div class="reply-meta">
                        ${isOwner ? `<button class="delete-reply-btn" data-rid="${replyId}" data-cid="${commentId}">حذف</button>` : ''}
                    </div>
                </div>`;

            if (isOwner) {
                const deleteBtn = card.querySelector('.delete-reply-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        if (!confirm("حذف هذا الرد؟")) return;
                        await deleteDoc(doc(db, "comments", commentId, "replies", replyId));
                        await adjustCommentCount(d.uid, -1);
                        showAlert("تم حذف الرد.");
                        loadReplies(commentId);
                    });
                }
            }
            fragment.appendChild(card);
        }
        repliesDiv.appendChild(fragment);
    } catch (error) {
        console.error("Error loading replies:", error);
        repliesDiv.innerHTML = '';
    }
}

function loadComments() {
    if (commentsUnsub) commentsUnsub();

    const entriesMap = new Map();
    let isLoading = true;

    function reorder() {
        const all = [...entriesMap.values()].sort((a, b) => {
            if (a.pinned !== b.pinned) return b.pinned - a.pinned;
            return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
        });
        const frag = document.createDocumentFragment();
        all.forEach(({ el }) => frag.appendChild(el));
        commentsList.replaceChildren(frag);
        commentsLabel.style.display = entriesMap.size > 0 ? 'block' : 'none';
    }

    const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));

    commentsUnsub = onSnapshot(q, async (snapshot) => {
        const promises = [];

        snapshot.docChanges().forEach(change => {
            const docSnap = change.doc;
            const data = docSnap.data();
            const commentId = docSnap.id;

            if (change.type === "added") {
                if (entriesMap.has(commentId)) return;

                const promise = (async () => {
                    const timeStr = formatDate(data.timestamp?.toDate());
                    const userData = await getUserData(data.uid);
                    const isOwner = currentUser?.uid === data.uid || currentUserData?.role === "owner";

                    const wrap = document.createElement('div');
                    wrap.id = `comment-wrap-${commentId}`;
                    wrap.className = `comment-tst`;


                    let commentMetaHTML = '';
                    if (currentUser) {
                        commentMetaHTML = `
                        <div class="comment-meta">
                            <button class="meta-action reply-toggle-btn" data-id="${commentId}">رد</button>
                            ${isOwner ? `<button class="meta-action delete" data-id="${commentId}">حذف</button>` : ''}
                        </div>`;
                    }

                    wrap.innerHTML = `
                    <div class="comment-card" id="comment-${commentId}">
                        <div class="comment-avatar">
                            <a href="https://0xdya.vercel.app/@${userData.name}" target="_blank">
                                <img src="${userData.photo}" alt="${userData.name}">
                            </a>
                        </div>
                        <div class="comment-body">
                            <div class="comment-bubble ${data.pinned ? 'pinned' : ''}">
                                <div class="bubble-author" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                    <a href="https://0xdya.vercel.app/@${userData.name}" target="_blank"
                                       style="color:inherit;font-weight:600;">${userData.name}</a>
                                    ${userData.verified ? VERIFIED_SVG : ''}
                                    ${getRoleIcon(userData.role)}
                                    <span style="opacity:.6;font-size:.75rem;">٠ ${timeStr}</span>
                                    ${data.pinned ? `<div class="pin-badge">(مثبت)</div>` : ''}
                                </div>
                                <div class="bubble-text">${escapeHtml(data.text)}
                                ${commentMetaHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="reply-form-wrap" id="reply-form-${commentId}">
                        <img src="${currentUser?.photoURL || 'https://0xdya.vercel.app/img/user.jpg'}" alt="">
                        <div class="reply-input-row">
                            <textarea placeholder="اكتب الرد ..." class="reply-input" rows="1"></textarea>
                            <button class="reply-submit-btn" data-id="${commentId}">ارسال</button>
                        </div>
                    </div>
                    <div class="replies-section" id="replies-${commentId}"></div>  <hr>`;


                    if (currentUser) {

                        const replyToggleBtn = wrap.querySelector('.reply-toggle-btn');
                        if (replyToggleBtn) {
                            replyToggleBtn.addEventListener('click', () => {
                                if (!currentUser) { showAlert("سجل الدخول أولاً", true); return; }
                                const form = document.getElementById(`reply-form-${commentId}`);
                                if (form) {
                                    form.classList.toggle('open');
                                    if (form.classList.contains('open')) {
                                        const textarea = form.querySelector('textarea');
                                        if (textarea) textarea.focus();
                                    }
                                }
                            });
                        }

                        const replySubmitBtn = wrap.querySelector('.reply-submit-btn');
                        if (replySubmitBtn) {
                            replySubmitBtn.addEventListener('click', async () => {
                                const input = wrap.querySelector('.reply-input');
                                const text = input?.value?.trim();
                                if (!text || !currentUser) return;
                                try {
                                    await addDoc(collection(db, "comments", commentId, "replies"), {
                                        uid: currentUser.uid,
                                        email: currentUser.email,
                                        text: text,
                                        timestamp: serverTimestamp()
                                    });
                                    input.value = "";
                                    const form = document.getElementById(`reply-form-${commentId}`);
                                    if (form) form.classList.remove('open');
                                    loadReplies(commentId);
                                    showAlert("تم إرسال الرد بنجاح");
                                } catch (error) {
                                    showAlert("فشل إرسال الرد", true);
                                    console.error(error);
                                }
                            });
                        }
                    }


                    if (isOwner) {
                        const deleteBtn = wrap.querySelector('.delete');
                        if (deleteBtn) {
                            deleteBtn.addEventListener('click', async () => {
                                if (!confirm("حذف هذا التعليق؟")) return;
                                try {
                                    await deleteDoc(doc(db, "comments", commentId));
                                    showAlert("تم حذف التعليق.");
                                } catch (error) {
                                    showAlert("فشل حذف التعليق", true);
                                    console.error(error);
                                }
                            });
                        }
                    }

                    entriesMap.set(commentId, { el: wrap, id: commentId, pinned: data.pinned, timestamp: data.timestamp });
                    reorder();
                    // تحميل الردود في الخلفية
                    setTimeout(() => loadReplies(commentId), 100);
                })();

                promises.push(promise);
            }

            if (change.type === "removed") {
                entriesMap.delete(commentId);
                const element = document.getElementById(`comment-wrap-${commentId}`);
                if (element) element.remove();
                reorder();
            }

            if (change.type === "modified") {
                const entry = entriesMap.get(commentId);
                if (entry) {
                    entry.pinned = data.pinned;
                    entry.timestamp = data.timestamp;
                    const bubble = entry.el.querySelector('.comment-bubble');
                    if (bubble) {
                        bubble.classList.toggle('pinned', !!data.pinned);
                        const pinBadge = bubble.querySelector('.pin-badge');
                        if (data.pinned && !pinBadge) {
                            const author = bubble.querySelector('.bubble-author');
                            if (author) {
                                author.insertAdjacentHTML('beforeend', `<div class="pin-badge">(مثبت)</div>`);
                            }
                        } else if (!data.pinned && pinBadge) {
                            pinBadge.remove();
                        }
                    }
                    reorder();
                }
            }
        });

        await Promise.all(promises);
        isLoading = false;

        // تحديث واجهة المستخدم
        if (commentForm) {
            commentForm.style.display = currentUser ? "block" : "none";
        }
        if (write_comment) {
            write_comment.style.display = currentUser ? "none" : "block";
        }
        syncReplyControls();
    });
}

if (commentForm) {
    commentForm.addEventListener('submit', async e => {
        e.preventDefault();
        const text = commentInput?.value?.trim();
        if (!text || !currentUser) {
            showAlert("الرجاء تسجيل الدخول أولاً", true);
            return;
        }

        const submitBtn = commentForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            await addDoc(collection(db, "comments"), {
                uid: currentUser.uid,
                email: currentUser.email,
                text: text,
                pinned: false,
                timestamp: serverTimestamp()
            });
            await adjustCommentCount(currentUser.uid, 1);
            if (commentInput) commentInput.value = '';
            showAlert("تم نشر التعليق بنجاح");
        } catch (error) {
            showAlert("فشل نشر التعليق.", true);
            console.error(error);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user) {
        if (currentUserAvatar) {
            currentUserAvatar.src = user.photoURL || 'https://0xdya.vercel.app/img/user.jpg';
        }
        const userRef = doc(db, "users", user.uid);
        try {
            await setDoc(userRef, {}, { merge: true });
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                currentUserData = { role: snap.data().role || null };
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        currentUserData = null;
        if (currentUserAvatar) {
            currentUserAvatar.src = 'https://0xdya.vercel.app/img/user.jpg';
        }
    }

    loadComments();
    syncReplyControls();
});
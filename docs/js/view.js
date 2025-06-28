
  // إعداد Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
  import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWvwW4DWzUQSBhKM3hUm77uJBhmPUNB-0",
    authDomain: "abaqtdh.firebaseapp.com",
    databaseURL: "https://abaqtdh-default-rtdb.firebaseio.com",
    projectId: "abaqtdh",
    storageBucket: "abaqtdh.firebasestorage.app",
    messagingSenderId: "442086429524",
    appId: "1:442086429524:web:6b269be25b625206dbaec1"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const countRef = ref(db, 'visits');

  // التحديث الفوري
  onValue(countRef, (snapshot) => {
    const count = snapshot.exists() ? snapshot.val() : 0;
    document.getElementById("counter").innerText = `${count}`;
  });

  // الزيادة مرة كل 24 ساعة فقط
  const last = localStorage.getItem('lastVisit');
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (!last || now - last > ONE_DAY) {
    // تحديث العداد بأمان
    runTransaction(countRef, (current) => {
      return (current || 0) + 1;
    });

    // حفظ وقت الزيارة
    localStorage.setItem('lastVisit', now);

    // عرض رسالة للزائر الجديد
    document.getElementById("welcome").innerText = "أهلاً بك لأول مرة!";
  }


async function sendMessage() {
    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();
    const btn = document.getElementById("sendBtn");
    const email = document.getElementById("email").value.trim();

    if (! message) {
        showStatus("اكتب رسالة أولاً ._.", "error");
        return;
    }
    
    if (! name) {
        showStatus("اكتب اسمك.", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "...";

    const text = `📩 رسالة جديدة من \n\n👤: ${
        name || "anonymous"
    }\n\n💬:\n${message}`;

    try {
        const res = await fetch('/api/contact', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {name, email, message}
            )
        });

        // const data = await res.json();

        if (res.ok) {
            showStatus("✓ msg sent successfully.", "success");
            document.getElementById("name").value = "";
            document.getElementById("message").value = "";
            document.getElementById("email").value = "";
        } else {
            showStatus("404 - حدث خطأ ما.", "error");
        }
    } catch {
        showStatus("فشل الاتصال، تاكد من الانترنات عندك.", "error");
    } btn.disabled = false;
 btn.innerHTML = ` ارسـال
    <svg fill="none" viewBox="0 0 24 24" height="14" width="14" stroke="currentColor" stroke-width="2" style="transform: scaleX(-1);">
        <line x1="22" x2="11" y1="2" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>`;
}

let statusTimeout;

function showStatus(msg, type) {
const el = document.getElementById("status");
clearTimeout(statusTimeout);
el.textContent = msg;
el.className = "status";
el.classList.add("show", type);
statusTimeout = setTimeout(() => {
    el.classList.remove("show");
}, 3000);
}

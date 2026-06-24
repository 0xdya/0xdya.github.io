async function sendMessage() {
    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();
    const btn = document.getElementById("sendBtn");
    const email = document.getElementById("email").value.trim();

    if (! message) {
        showStatus("write a message first.", "error");
        return;
    }
    
    if (! name) {
        showStatus("add a name.", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "sending...";

    const text = `📩 new message from your site\n\n👤 name: ${
        name || "anonymous"
    }\n\n💬 message:\n${message}`;

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
            showStatus("error — something went wrong.", "error");
        }
    } catch {
        showStatus("connection failed.", "error");
    } btn.disabled = false;
 btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> send`;
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

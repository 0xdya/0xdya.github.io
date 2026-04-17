async function sendMessage() {
    var e = document.getElementById("name").value.trim(),
        em = document.getElementById("email").value.trim(),
        t = document.getElementById("message").value.trim();
    const s = document.getElementById("sendBtn");
    if (t) {
        s.disabled = !0, s.textContent = "sending...";
        try {
            (await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: e, email: em, message: t })
            })).ok
                ? (showStatus("✓ msg sent successfully.", "success"),
                   document.getElementById("name").value = "",
                   document.getElementById("email").value = "",
                   document.getElementById("message").value = "")
                : showStatus("error — something went wrong.", "error")
        } catch {
            showStatus("connection failed.", "error")
        }
        s.disabled = !1, s.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> send'
    } else showStatus("write a message first.", "error")
}
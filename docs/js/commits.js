const list = document.getElementById("commitsList");
for (let i = 0; i < 8; i++) {
    const li = document.createElement("li");
    li.innerHTML = `<div class="skeleton-row">
<div class="sk" style="width:6px;height:6px;border-radius:50%;flex-shrink:0"></div>
<div class="sk" style="width:72px;height:11px"></div>
<div class="sk" style="width:${180 + Math.floor(Math.random() * 160)
        }px;height:13px"></div>
</div>`;
    list.appendChild(li);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function loadCommits() {
    try {
        const res = await fetch("/api/github_commits");
        const data = await res.json();
        if (!Array.isArray(data))
            throw new Error("Unexpected response");

        list.innerHTML = "";

        const filteredCommits = data.filter(commit => {
            const msg = commit.commit.message.split("\n")[0].toLowerCase();
            return !msg.startsWith("auto");
        });

        filteredCommits.forEach(commit => {
            const msg = commit.commit.message.split("\n")[0];
            const date = new Date(commit.commit.author.date).toISOString().slice(0, 10);
            const url = commit.html_url;
            
            const li = document.createElement("li");
            li.innerHTML = `<a href="${url}" target="_blank" rel="noopener">
                <span class="commit-dot"></span>
                <span class="commit-date">${date}</span>
                <span class="commit-msg">${escapeHtml(msg)}</span>
                <ion-icon name="arrow-forward-outline" class="commit-arrow"></ion-icon>
            </a>`;
            list.appendChild(li);
        });

        document.getElementById("countBadge").textContent = filteredCommits.length;

    } catch (err) {
        console.error(err);
        list.innerHTML = `<li><div class="error-row">⚠️ Failed to load commits</div></li>`;
    }
}

loadCommits();

const btn = document.getElementById("back_to_top");
window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
});
btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

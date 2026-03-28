const loader = document.getElementById('loader-wrapper');
const showLoaderTimeout = setTimeout(() => { loader.style.display = 'flex'; }, 100);
window.addEventListener('load', () => { loader.classList.add('loader-hidden'); setTimeout(() => loader.style.display = 'none', 300); AOS.init({duration: 600, once: true, easing: 'ease-out-quart'}); clearTimeout(showLoaderTimeout); });
(function () { const SKIN_PATH = "./skin/s2.png"; const canvas = document.getElementById('mc-head'); const SIZE = 82; canvas.width = SIZE; canvas.height = SIZE; const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: true}); renderer.setPixelRatio(window.devicePixelRatio); renderer.setClearColor(0x000000, 0); renderer.setSize(SIZE, SIZE); const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); camera.position.set(0, 0, 4.2); scene.add(new THREE.AmbientLight(0xffffff, 0.85)); const dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(3, 5, 3); scene.add(dir); function buildFace(img, sx, sy, sw, sh) { const c = document.createElement('canvas'); c.width = sw; c.height = sh; const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return new THREE.MeshLambertMaterial({map: t, transparent: true}); } function buildHead(img, scale, ox) { const mats = [buildFace(img, ox + 16, 8, 8, 8), buildFace(img, ox + 0, 8, 8, 8), buildFace(img, ox + 8, 0, 8, 8), buildFace(img, ox + 16, 0, 8, 8), buildFace(img, ox + 8, 8, 8, 8), buildFace(img, ox + 24, 8, 8, 8), ]; return new THREE.Mesh(new THREE.BoxGeometry(scale, scale, scale), mats); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = function () { const group = new THREE.Group(); group.add(buildHead(img, 1, 0)); if (img.height === 64) group.add(buildHead(img, 1.12, 32)); group.rotation.x = 0.18; scene.add(group); (function animate(time) { requestAnimationFrame(animate); group.rotation.y = time * 0.00085; renderer.render(scene, camera); })(); }; img.src = SKIN_PATH; })();
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [{ label: 'year', seconds: 31536000 }, { label: 'month', seconds: 2592000 }, { label: 'day', seconds: 86400 }, { label: 'hour', seconds: 3600 }, { label: 'minute', seconds: 60 }, { label: 'second', seconds: 1 } ];
    for(const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if(count > 0) return count + ' ' + i.label +(count > 1 ? 's' : '');

    }
    return 'just now';
}
async function loadLatestCommit() {
    try {
        const res = await fetch('/api/github_commits');
        if(!res.ok) throw new Error('فشل جلب الكوميتات');

        const commits = await res.json();
        const latest = commits.find(c => { const msg = c.commit.message.split("\n")[0].toLowerCase(); return !msg.startsWith("auto"); });

        if(!latest) throw new Error("No valid commits");

        const message = latest.commit.message;
        const date = new Date(latest.commit.author.date);

        document.getElementById("commit-msg").textContent = message;
        document.getElementById("commit-auth").textContent = latest.author ? latest.author.login: latest.commit.author.name;

        document.getElementById("commit-time").textContent = date.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

        const timeAgoElem = document.querySelector(".time_ago");
        if(timeAgoElem) timeAgoElem.textContent = timeAgo(date);

    }
    catch(err) {
        console.error(err);
        document.getElementById("commit-msg").textContent = "Failed to load commit";
    }
}

loadLatestCommit();
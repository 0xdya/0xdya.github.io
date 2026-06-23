const nodes = new vis.DataSet([
  { id: 0, label: '<|>', x: 0, y: 0 }, // المركز ثابت
  { id: 1, label: 'مبرمج', link: './projects/#tools', x: -140, y: -100 }, // أعلى اليسار
  { id: 2, label: 'كاتب', link: './projects/#book', x: 140, y: -100 },  // أعلى اليمين
  { id: 3, label: 'شاعر', link: './poetry/', x: 160, y: 100 },        // أسفل اليمين
  { id: 4, label: 'رسام', link: './projects/#paint', x: -160, y: 100 }  // أسفل اليسار
]);

const edges = new vis.DataSet([
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  
  // الروابط الخارجية الإضافية الموزعة هندسياً:
  { from: 1, to: 2 }, // أفقي أعلى
  { from: 4, to: 3 }, // أفقي أسفل
  { from: 1, to: 3 }, // قطري مائل
  { from: 4, to: 2 }  // قطري مائل متقاطع
]);

const container = document.getElementById('network');
const data = { nodes, edges };

const options = {
  nodes: {
    shape: 'box',
    borderWidth: 1,
    borderWidthSelected: 1,
    shadow: false,
    chosen: false,
    widthConstraint: { minimum: 90 },
    heightConstraint: { minimum: 30 },
    font: {
      color: '#ededed',
      size: 24,
      align: 'center'
    },
    color: {
      border: '#444444',
      background: '#1e1e1e',
      highlight: {
        border: '#444444',
        background: '#1e1e1e'
      }
    }
  },
  edges: {
    width: 1.2,
    hoverWidth: 0,
    selectionWidth: 0,
    smooth: true,
    color: {
      color: '#888888',
      highlight: '#888888'
    }
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    hover: false,
    keyboard: false,
    navigationButtons: false
  },
  physics: {
    enabled: true
  }
};

const network = new vis.Network(container, data, options);

const animationFrames = [
  '<|>', 
  '</>',
  '<->',  
  '<\\>'  
];
let currentFrame = 0;

setInterval(() => {
  currentFrame = (currentFrame + 1) % animationFrames.length;
  nodes.update({ id: 0, label: animationFrames[currentFrame] });
}, 600); 
// -------------------------------------------

network.on('click', function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId);
    
    if (node && node.link) {
      window.location.href = node.link;
    }
  }
});


network.on('click', function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId);
    
    if (node && node.link) {
      window.location.href = node.link;
    }
  }
});

const loader = document.getElementById('loader-wrapper');
const showLoaderTimeout = setTimeout(() => {
    loader.style.display = 'flex';
}, 100);
window.addEventListener('load', () => {
    loader.classList.add('loader-hidden');
    setTimeout(() => loader.style.display = 'none', 300);
    AOS.init({duration: 600, once: true, easing: 'ease-out-quart'});
    clearTimeout(showLoaderTimeout);
});
(function () {
    const SKIN_PATH = "./skin/s2.png";
    const canvas = document.getElementById('mc-head');
    const SIZE = 82;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SIZE, SIZE);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(3, 5, 3);
    scene.add(dir);

    const group = new THREE.Group();
    scene.add(group);

    function buildFace(img, sx, sy, sw, sh) {
        const c = document.createElement('canvas');
        c.width = sw; c.height = sh;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        return new THREE.MeshLambertMaterial({ map: t, transparent: true });
    }

    function buildHead(img, scale, ox) {
        const mats = [
            buildFace(img, ox + 16, 8, 8, 8),
            buildFace(img, ox + 0, 8, 8, 8),
            buildFace(img, ox + 8, 0, 8, 8),
            buildFace(img, ox + 16, 0, 8, 8),
            buildFace(img, ox + 8, 8, 8, 8),
            buildFace(img, ox + 24, 8, 8, 8),
        ];
        return new THREE.Mesh(new THREE.BoxGeometry(scale, scale, scale), mats);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
        group.add(buildHead(img, 1, 0));
        if (img.height === 64) group.add(buildHead(img, 1.12, 32));
        renderScene(0.6, -0.4); 
    };
    img.src = SKIN_PATH;

    function renderScene(rotX, rotY) {
        group.rotation.x = rotX;
        group.rotation.y = rotY;
        renderer.render(scene, camera);
    }

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        let targetRotY = Math.atan2(deltaX, 400); 
        let targetRotX = Math.atan2(deltaY, 400) + 0.18; 
        targetRotY = Math.max(-1.2, Math.min(1.2, targetRotY));
        targetRotX = Math.max(-1.0, Math.min(1.0, targetRotX));

        renderScene(targetRotX, targetRotY);
    });
})();

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        {
            label: 'year',
            seconds: 31536000
        },
        {
            label: 'month',
            seconds: 2592000
        },
        {
            label: 'day',
            seconds: 86400
        },
        {
            label: 'hour',
            seconds: 3600
        }, {
            label: 'minute',
            seconds: 60
        }, {
            label: 'second',
            seconds: 1
        }
    ];
    for (const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if (count > 0) 
            return count + ' ' + i.label + (count > 1 ? 's' : '');
        

    }
    return 'منذ قليل';
}

async function loadLatestCommit() {
    try {
        const res = await fetch('/api/github_commits');
        if (! res.ok) 
            throw new Error('فشل جلب الكوميتات');
        

        const commits = await res.json();
        const latest = commits.find(c => {
            const msg = c.commit.message.split("\n")[0].toLowerCase();
            return ! msg.startsWith("auto") && !msg.startsWith("hidden");
        });

        if (! latest) 
            throw new Error("No valid commits");
        

        const message = latest.commit.message;
        const date = new Date(latest.commit.author.date);

        document.getElementById("commit-msg").textContent = message;
        document.getElementById("commit-auth").textContent = latest.author ? latest.author.login : latest.commit.author.name;

        document.getElementById("commit-time").textContent = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        const timeAgoElem = document.querySelector(".time_ago");
        if (timeAgoElem) 
            timeAgoElem.textContent = timeAgo(date);
        

    } catch (err) {
        console.error(err);
        document.getElementById("commit-msg").textContent = "فشل جلب آخر كوميت";
    }
}

loadLatestCommit();

let lastY = window.scrollY;
window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const navbar = document.querySelector('.navbar_section');
    
    if (currentY > lastY) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    
    lastY = currentY;
});
 
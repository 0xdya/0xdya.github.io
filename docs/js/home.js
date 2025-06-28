var nodes = new vis.DataSet([
  { id: 0, label: '0xdya', x: 300, y: 0 },
  { id: 1, label: 'Blog', link: './blog/', x: 100, y: -120 },
  { id: 2, label: 'Comments', link: './comments/', x: 100, y: -40 },
  { id: 3, label: 'Poetry', link: './poetry/', x: 100, y: 40 },
  { id: 4, label: 'Projects', link: './projects/', x: 100, y: 120 },
  { id: 6, label: 'Users', link: './users/', x: -100, y: 160 },
]);

var edges = new vis.DataSet([
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  { from: 0, to: 6 },
  { from: 2, to: 3 },
  { from: 2, to: 1 },
  { from: 6, to: 3 },
  { from: 6, to: 4 },
  { from: 4, to: 1 },
]);

var container = document.getElementById('network');
var data = { nodes: nodes, edges: edges };
var options = {
  nodes: {
    shape: 'box',
    font: {
      color: "#ededed",
      face: 'monospace',
      size: 16,
      align: 'center'
    },
    color: {
      border: '#444444',
      background: "#1e1e1e",
    },
    widthConstraint: { minimum: 90 },
    heightConstraint: { minimum: 30 },
    shadow: false,
    hover: false,
    chosen: false,
    borderWidth: 1,
    borderWidthSelected: 0
  },
  edges: {
    color: {
      color: '#888888',
      highlight: '#888888'
    },
    width: 1.2,
    hoverWidth: 0,
    selectionWidth: 0,
    smooth: true,
    hover: false
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    hover: false,
    keyboard: true,
    tooltips: false,
    highlightNearest: false,
    navigationButtons: false
  },
  tooltip: false
};

var network = new vis.Network(container, data, options);

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId);
    const radius = 150;
    const angles = [0, 60, 120, 180, 240, 300]; // degrees
    const positions = angles.map(angle => {
      const rad = angle * Math.PI / 180;
      return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
    });
    if (node && node.link) {
      window.location.href = node.link;
    }
  }
});

// update card
function makeDraggable(box) {
  let isDragging = false, offsetX, offsetY, posX = 0, posY = 0;
  box.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - posX;
    offsetY = e.clientY - posY;
    box.style.cursor = "grabbing";
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      posX = e.clientX - offsetX;
      posY = e.clientY - offsetY;
      box.style.transform = `translate(${posX}px, ${posY}px)`;
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    box.style.cursor = "grab";
  });
}

function fetchUpdateDetails() {
  fetch("./update_log.json")
    .then(response => response.json())
    .then(data => {
      let updateHTML = ``;
      updateHTML += ``;
      if (data.newFeatures.length > 0) {
        updateHTML += ` <div dir="ltr" class="update_line"> <span class="tr_txt "><ion-icon class="row_ion" name="return-down-back-outline"></ion-icon> Features</span>:`;
        data.newFeatures.forEach(feature => {
          updateHTML += `<span class="tr_txt2">${feature}</span></div>`;
        });
      }
      if (data.bugFixes.length > 0) {
        updateHTML += ` <div dir="ltr" class="update_line"><span class="tr_txt "><ion-icon class="row_ion" name="return-down-back-outline"></ion-icon> Fixes</span>: `;
        data.bugFixes.forEach(fix => {
          updateHTML += `<span class="tr_txt2">${fix}</span></div>`;
        });
      }
      document.getElementById("update-details").innerHTML = updateHTML;
    })
    .catch(() => {
      document.getElementById("update-details").textContent = "⚠️ Failed to load updates!";
    });
}

fetchUpdateDetails();

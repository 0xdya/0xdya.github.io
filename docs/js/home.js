document.addEventListener('DOMContentLoaded', () => {
    // back_to_top 
  const btn = document.getElementById("back_to_top");
  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;

    if (scrollTop > 200) {
      // إظهار الزر بتأثير الصعود إذا لم يكن ظاهراً أو قيد الهبوط
      if (!btn.classList.contains("show-up") && btn.style.display !== "block") {
        btn.classList.remove("show-down");
        btn.classList.add("show-up");
        btn.style.display = "block";
      }
    } else {
      // إخفاء الزر بتأثير الهبوط إذا كان ظاهراً أو قيد الصعود
      if (!btn.classList.contains("show-down") && btn.style.display === "block") {
        btn.classList.remove("show-up");
        btn.classList.add("show-down");

        // إخفاء الزر بعد انتهاء الأنميشن
        setTimeout(() => {
          btn.style.display = "none";
        }, 500); // نفس مدة الأنميشن
      }
    }
  });
  // التنقل السلس للأعلى عند الضغط على الزر
  btn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
  

	const list = document.getElementById("ion_list");
	const ion_list_btn = document.getElementById("ion_list_btn");
	const storageKey = "ion_list_order";

	let sortable = null;
	let isActive = false;

	function loadOrder() {
		const savedOrder = JSON.parse(localStorage.getItem(storageKey));
		if (savedOrder) {
			const items = Array.from(list.children);
			savedOrder.forEach(id => {
				const item = items.find(el => el.dataset.id === id);
				if (item) list.appendChild(item);
			});
		}
	}

	function saveOrder() {
		const order = Array.from(list.children).map(el => el.dataset.id);
		localStorage.setItem(storageKey, JSON.stringify(order));
	}

	function enableSortable() {
		sortable = new Sortable(list, {
			animation: 150,
			onEnd: saveOrder
		});
	}

	function disableSortable() {
		if (sortable) {
			sortable.destroy();
			sortable = null;
		}
	}

	ion_list_btn.addEventListener("click", () => {
		isActive = !isActive;
		if (isActive) {
			enableSortable();
			ion_list_btn.innerHTML = ' edit mode is on<ion-icon name="lock-open-outline"></ion-icon>';
		} else {
			disableSortable();
			ion_list_btn.innerHTML = 'edit mode is off <ion-icon name="lock-closed-outline"></ion-icon>';
		}
	});

	loadOrder();
  
  
  const themeToggle = document.getElementById('themeToggle');
  const dropdown = document.getElementById('themeDropdown');
  const buttons = dropdown.querySelectorAll('button');

  function getNodeBg() {
    return getComputedStyle(document.body).getPropertyValue('--node-bg').trim();
  }
  function getTxtColor() {
    return getComputedStyle(document.body).getPropertyValue('--node-txt').trim();
  }

  const themeIcons = {
    light: 'sunny-outline',
    dark: 'moon-outline',
    system: 'contrast-outline'
  };

  function updateToggleIcon(theme) {
    const iconName = themeIcons[theme] || 'contrast-outline';
    while (themeToggle.firstChild) {
      themeToggle.removeChild(themeToggle.firstChild);
    }
    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', iconName);
    themeToggle.appendChild(icon);
  }

  themeToggle.addEventListener('click', () => {
    dropdown.classList.toggle('show');
  });

  // تهيئة الشبكة ستكون هنا لاحقًا
  let network;

  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      document.body.classList.remove('dark_theme', 'light_theme');

      if (theme === 'dark') {
        document.body.classList.add('dark_theme');
      } else if (theme === 'light') {
        document.body.classList.add('light_theme');
      } else if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.body.classList.add('dark_theme');
        } else {
          document.body.classList.add('light_theme');
        }
      }

      localStorage.setItem('theme', theme);
      updateToggleIcon(theme);
      dropdown.classList.remove('show');

      // تحديث لون العقد بعد تغيير الثيم
      if (network) {
        network.setOptions({
          nodes: {
            font: {
        color: getTxtColor(),
            },
            color: {
              background: getNodeBg()
            }
          }
        });
      }
    });
  });
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const savedButton = dropdown.querySelector(`[data-theme="${savedTheme}"]`);
  if (savedButton) {
    savedButton.click(); // هذا سيطبّق الكلاس الصحيح
    updateToggleIcon(savedTheme);
  }

  // ⚠️ إنشاء الشبكة الآن (بعد تطبيق الثيم فعليًا)
  const nodes = new vis.DataSet([
    { id: 0, label: '</>', x: 300, y: 0 },
    { id: 1, label: 'blog', link: './blog/', x: 100, y: -120 },
    { id: 2, label: 'users', link: './users/', x: 100, y: -40 },
    { id: 3, label: 'projects', link: './projects/', x: 100, y: 40 },
    { id: 4, label: 'poetry', link: './poetry/', x: 100, y: 120 },
    { id: 5, label: 'comments', link: './comments/', x: -100, y: 160 }
  ]);

  const edges = new vis.DataSet([
    { from: 0, to: 1 }, 
    { from: 0, to: 2 }, 
    { from: 0, to: 3 },
    { from: 0, to: 4 }, 
    { from: 0, to: 5 }, 
    { from: 2, to: 3 },
    { from: 2, to: 1 }, 
    { from: 5, to: 3 }, 
    { from: 4, to: 1 },
    { from: 4, to: 5 }
  ]);

  const container = document.getElementById('network');
  const data = { nodes: nodes, edges: edges };

  const options = {
    nodes: {
      shape: 'box',
      font: {
        color: getTxtColor(),
        size: 16,
        align: 'center'
      },
      color: {
        border: '#444444',
        background: getNodeBg()
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

network = new vis.Network(container, data, options);

const svgString = `
<svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.762 15.52l-0.265-0.252c-0.005-0.005-0.011-0.007-0.017-0.011l-4.055-3.701c-0.292-0.28-0.764-0.28-1.057 0l-0.172 0.252c-0.292 0.28-0.197 0.732 0.095 1.011l2.39 2.167h-11.605v-11.667l2.167 2.389c0.279 0.292 0.732 0.387 1.011 0.094l0.252-0.171c0.279-0.293 0.279-0.765 0-1.058l-3.537-3.874c-0.086-0.173-0.219-0.317-0.385-0.415l-0.044-0.046c-0.139-0.146-0.323-0.219-0.507-0.218-0.184-0.001-0.368 0.072-0.509 0.218l-0.253 0.264c-0.005 0.005-0.005 0.011-0.011 0.017l-3.61 3.992c-0.279 0.292-0.279 0.764 0 1.057l0.252 0.171c0.279 0.292 0.732 0.197 1.011-0.095l2.161-2.41v11.749h-11.759l2.389-2.167c0.292-0.28 0.387-0.732 0.095-1.011l-0.171-0.252c-0.293-0.28-0.766-0.28-1.058 0l-3.874 3.537c-0.173 0.085-0.317 0.219-0.415 0.384l-0.046 0.044c-0.146 0.139-0.219 0.324-0.218 0.508-0.001 0.184 0.071 0.368 0.218 0.509l0.265 0.253c0.005 0.005 0.011 0.006 0.016 0.011l3.992 3.61c0.292 0.279 0.764 0.279 1.058 0l0.171-0.252c0.292-0.279 0.197-0.733-0.095-1.012l-2.41-2.161h11.844v11.78l-2.161-2.41c-0.28-0.292-0.732-0.387-1.011-0.095l-0.252 0.171c-0.279 0.293-0.279 0.765 0 1.057l3.61 3.992c0.005 0.006 0.006 0.012 0.011 0.017l0.253 0.265c0.141 0.146 0.325 0.219 0.509 0.218 0.183 0.001 0.368-0.072 0.507-0.218l0.253-0.265c0.005-0.005 0.007-0.011 0.012-0.017l3.701-4.055c0.279-0.292 0.279-0.764 0-1.057l-0.252-0.172c-0.279-0.292-0.732-0.197-1.011 0.095l-2.167 2.39v-11.698h11.687l-2.41 2.161c-0.292 0.279-0.387 0.733-0.095 1.012l0.171 0.252c0.293 0.279 0.765 0.279 1.057 0l3.992-3.61c0.006-0.006 0.012-0.006 0.017-0.010l0.265-0.253c0.146-0.14 0.219-0.324 0.218-0.509 0.001-0.183-0.072-0.368-0.218-0.507z"></path>
</svg>
`;

container.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];

  // إنشاء div غلاف لوضع svg داخله
  const wrapper = document.createElement('div');
  wrapper.className = 'touch-svg';
  wrapper.id = 'touch-indicator';
  wrapper.style.left = `${touch.clientX}px`;
  wrapper.style.top = `${touch.clientY}px`;
  wrapper.innerHTML = svgString;

  document.body.appendChild(wrapper);
});

container.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const wrapper = document.getElementById('touch-indicator');
  if (wrapper) {
    wrapper.style.left = `${touch.clientX}px`;
    wrapper.style.top = `${touch.clientY}px`;
  }
});

container.addEventListener('touchend', () => {
  const wrapper = document.getElementById('touch-indicator');
  if (wrapper) wrapper.remove();
});







  const animationLabels = ['<|>', '<\\>', '<–>', '</>'];
  let labelIndex = 0;
  setInterval(() => {
    labelIndex = (labelIndex + 1) % animationLabels.length;
    nodes.update({ id: 0, label: animationLabels[labelIndex] });
  }, 600);

  network.on("click", function (params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = nodes.get(nodeId);
      if (node && node.link) {
        window.location.href = node.link;
      }
    }
  });
  
  
  

  
  
  
  
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
        updateHTML += ` <div dir="ltr" class="update_line"> <span class="tr_txt">> Features:</span>`;
        data.newFeatures.forEach(feature => {
          updateHTML += `<span class="tr_txt2 feature">${feature}</span></div>`;
        });
      }
      if (data.bugFixes.length > 0) {
        updateHTML += ` <div dir="ltr" class="update_line"><span class="tr_txt">> Fixes:</span> `;
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
function getBackgroundColor() {
  if (document.body.classList.contains('light_theme')) {
    return '#fff';
  } else {
    return '#111';
  }
}


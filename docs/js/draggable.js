
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
  
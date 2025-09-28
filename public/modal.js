// API simple para el modal de edición
// Exporta funciones para abrir/cerrar, leer y escribir valores, y suscribir al evento Update

export function getEditElements() {
  return {
    modal: document.getElementById('edit-modal'),
    inputId: document.getElementById('edit-prod-id'),
    inputName: document.getElementById('edit-prod-name'),
    inputQuantity: document.getElementById('edit-quantity'),
    inputPrice: document.getElementById('edit-price'),
    btnCancel: document.getElementById('edit-cancel-button'),
    btnUpdate: document.getElementById('edit-update-button')
  };
}

export function showModal() {
  const { modal } = getEditElements();
  if (!modal) return;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  const panel = modal.querySelector('.transform');
  if (panel) panel.classList.remove('scale-95');
}

export function hideModal() {
  const { modal } = getEditElements();
  if (!modal) return;
  modal.classList.add('opacity-0');
  const panel = modal.querySelector('.transform');
  if (panel) panel.classList.add('scale-95');
  setTimeout(() => modal.classList.add('pointer-events-none'), 300);
}

export function fillModalFields(prod) {
  const { inputId, inputName, inputQuantity, inputPrice } = getEditElements();
  if (inputId) inputId.value = prod.code || prod._id || '';
  if (inputName) inputName.value = prod.nombre || '';
  if (inputQuantity) inputQuantity.value = prod.stock || '';
  if (inputPrice) inputPrice.value = prod.price ?? '';
}

export function onModalUpdate(handler) {
  const { btnUpdate } = getEditElements();
  if (!btnUpdate) return;
  btnUpdate.addEventListener('click', handler);
}

export function onModalCancel(handler) {
  const { btnCancel } = getEditElements();
  if (!btnCancel) return;
  btnCancel.addEventListener('click', handler);
}

export function attachBackdropClose() {
  const { modal } = getEditElements();
  if (!modal) return;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });
}

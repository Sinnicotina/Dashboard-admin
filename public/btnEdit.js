import { fillModalFields, showModal, hideModal, onModalUpdate, onModalCancel, attachBackdropClose } from './modal.js';

// Crea un pequeño módulo que maneja los botones Edit
export default function createEditModule({ showToast, reloadList }) {
  let currentEditProductId = null;

  // Asegura cierre al clicar el backdrop
  attachBackdropClose();

  async function handleEditClick(btn) {
    const id = btn.getAttribute('data-id');
    if (!id) return showToast('No se pudo identificar el producto', 'error');
    currentEditProductId = id;
    try {
      const res = await fetch(`/products/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener producto');
      const prod = await res.json();
      fillModalFields(prod);
      showModal();
    } catch (err) {
      console.error('Error fetching product for edit', err);
      showToast('Error obteniendo producto', 'error');
    }
  }

  // Suscribimos el handler del Update del modal
  onModalUpdate(async () => {
    if (!currentEditProductId) return showToast('No hay producto seleccionado', 'error');
    const nameInput = document.getElementById('edit-prod-name');
    const quantityInput = document.getElementById('edit-quantity');
    const priceInput = document.getElementById('edit-price');
    const payload = {
      nombre: nameInput?.value,
      stock: quantityInput?.value,
      price: Number((priceInput?.value || '').toString().replace(/[^0-9\.\-]/g, ''))
    };
    try {
      const res = await fetch(`/products/${currentEditProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al actualizar');
      const updated = await res.json();
      showToast('Producto actualizado', 'success');
      hideModal();
      // Intentamos actualizar tarjeta en la UI
      const card = document.querySelector(`[data-id-card='${currentEditProductId}']`);
      if (card) {
        const nameEl = card.querySelector('.product-name');
        const stockEl = card.querySelector('.product-stock');
        const priceEl = card.querySelector('.product-price');
        if (nameEl) nameEl.textContent = updated.nombre || '';
        if (stockEl) stockEl.textContent = updated.stock || '';
        if (priceEl) priceEl.textContent = `$${Number(updated.price).toLocaleString()}`;
      } else if (typeof reloadList === 'function') {
        reloadList();
      }
    } catch (err) {
      console.error('Error updating product', err);
      showToast('Error actualizando producto', 'error');
    }
  });

  // Exponer función para asociar botones edit renderizados
  function bindEditButtons(buttons) {
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditClick(btn);
      });
    });
  }

  // permitir cancelar (botón cancel) y cerrar backdrop
  onModalCancel(() => hideModal());

  return { bindEditButtons };
}

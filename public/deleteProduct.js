// deleteProduct.js
// Módulo que encapsula la lógica de borrado en el frontend, incluyendo el modal,
// el programado del borrado con opción Undo y la comunicación con la API.
// Exporta una función que crea y devuelve un objeto con el método `bindDeleteButtons`
// para asociar botones ya renderizados.

export default function createDeleteModule({ showToast, showToastWithUndo } = {}) {
  // Variables privadas del módulo
  // `modal` referencia el overlay del modal de confirmación
  const modal = document.getElementById('delete-modal');
  // botones dentro del modal identificados por clase en el HTML
  const cancelButtons = modal ? modal.querySelectorAll('button.cancel') : [];
  const confirmButton = modal ? modal.querySelector('button.confirm') : null;

  // estado temporal para la selección actual (id y card)
  let selectedId = null;
  let selectedCard = null;

  // Mapa para almacenar timers de borrado programado: id -> { timer, card }
  const pendingDeletes = new Map();

  // Función para mostrar el modal: manipulamos clases CSS (tailwind) para animar
  function showModal() {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.transform').classList.remove('scale-95');
  }

  // Función para ocultar el modal y limpiar selección
  function hideModal() {
    if (!modal) return;
    modal.classList.add('opacity-0');
    modal.querySelector('.transform').classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('pointer-events-none');
    }, 300);
    selectedId = null;
    selectedCard = null;
  }

  // Si se hace click fuera del dialog, cerramos
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }

  // Si se presionan los botones Cancel del modal, cerramos
  cancelButtons.forEach(btn => btn.addEventListener('click', hideModal));

  // scheduleDelete: programa el DELETE en `timeout` ms y muestra un toast con Undo
  function scheduleDelete(id, card, timeout = 6000) {
    // atenuamos la tarjeta para indicar estado pendiente
    if (card) card.style.opacity = '0.4';

    // Creamos el timer que hará la petición DELETE al servidor
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        // removemos la tarjeta del DOM si aún existe
        if (card && card.parentNode) card.remove();
        if (showToast) showToast('Producto eliminado', 'success');
      } catch (err) {
        console.error('❌ Error borrando producto:', err);
        if (showToast) showToast('Error borrando producto', 'error');
        // restauramos apariencia
        if (card) card.style.opacity = '';
      } finally {
        pendingDeletes.delete(id);
      }
    }, timeout);

    // Guardamos el timer para permitir undo
    pendingDeletes.set(id, { timer, card });

    // Mostramos toast con botón Undo que cancela el timer
    if (showToastWithUndo) {
      showToastWithUndo('Producto programado para eliminarse', id, () => {
        const entry = pendingDeletes.get(id);
        if (entry) {
          clearTimeout(entry.timer);
          if (entry.card) entry.card.style.opacity = '';
          pendingDeletes.delete(id);
          if (showToast) showToast('Acción deshecha', 'info');
        }
      }, timeout);
    }
  }

  // bindDeleteButtons: asocia los listeners a los botones de borrado ya renderizados
  function bindDeleteButtons(buttons) {
    if (!buttons || !buttons.forEach) return;
    buttons.forEach(button => {
      // al hacer click guardamos el id y la tarjeta relacionada y mostramos modal
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedId = button.dataset.id;
        selectedCard = button.closest('.product-card');
        showModal();
      });
    });

    // handler del botón Confirm del modal: programa el borrado diferido
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        if (!selectedId) return;
        scheduleDelete(selectedId, selectedCard);
        hideModal();
      });
    }
  }

  // Exportamos la API pública del módulo
  return {
    bindDeleteButtons,
    // útil para pruebas o para cancelar programaciones desde fuera
    _pendingDeletes: pendingDeletes
  };
}

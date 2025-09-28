
import createDeleteModule from './deleteProduct.js';
import createEditModule from './btnEdit.js';

document.addEventListener("DOMContentLoaded", () => {
    const btnLoad = document.getElementById("btn-load");
    const productList = document.getElementById("products-list");

    if (!btnLoad || !productList) {
        console.error("❌ No se encontró el botón o el contenedor en el DOM");
        return;
    }

    // Crear el módulo de edición una sola vez para evitar múltiples listeners en el botón Update
    const editModule = createEditModule({ showToast, reloadList: () => btnLoad.click() });

    btnLoad.addEventListener("click", async () => {
        try {
            // 🔍 Detecta si estamos en local o en producción
            // Usar ruta relativa permite funcionar tanto en dev (localhost:5000) como en producción
            const API_URL = "/products";

            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

            const products = await res.json();

            productList.innerHTML = "";

            products.forEach(product => {
                    const card = document.createElement("div");
                    card.classList.add("product-card");
                    // atributo para localizar la tarjeta y actualizarla después de editar
                    card.setAttribute('data-id-card', product._id);

                card.innerHTML = `
            <div class="group flex flex-col gap-3">
                <div class"img"
                    class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105"
                    style='background-image: url(${product.img});'>
            </div>
          
                <div class="flex flex-col gap-1.5">
                    <p class="font-medium text-base product-name">${product.nombre}</p>
                    <p class="text-xs text-primary">ID: ${product.code || product._id}</p>
                    <div class="flex justify-between items-center text-sm">
                        <p class="text-primary">Stock:  <span class="font-medium text-black dark:text-white product-stock"> ${product.stock || "N/A"}</span></p>
                        <p class="font-medium product-price">$${Number(product.price).toLocaleString()} </p>
            </div>
            </div>
            <div class="flex gap-2">
                                <button data-id="${product._id}"
                                class="edit-button flex-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors py-2 rounded-md flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-base">edit</span>
                                    <span>Edit</span>
                                </button>
                <button
    class="flex-1 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors py-2 rounded-md flex items-center justify-center gap-1 btn-delete"
    data-id="${product._id}">
  <span class="material-symbols-outlined text-base">delete</span>
  <span>Delete</span>
</button>
            </div>
            </div>
            `;
                productList.appendChild(card);
                    

            });
        } catch (error) {
            console.error("❌ Error cargando productos:", error);
            productList.innerHTML = "<p>Error cargando productos. Revisa la consola.</p>";
            showToast('Error cargando productos', 'error');
        }
    // Botones de borrado (añadidos a cada tarjeta como .btn-delete)
        const deleteButtons = document.querySelectorAll('.btn-delete');
        // Creamos el módulo de borrado, le pasamos las funciones de toast para feedback
        const deleteModule = createDeleteModule({ showToast, showToastWithUndo });
        // Asociamos los botones renderizados al módulo para que maneje modal, undo y DELETE
        deleteModule.bindDeleteButtons(deleteButtons);

    // ---- Edit buttons handling (delegado a btnEdit.js) ----
    const editButtons = document.querySelectorAll('.edit-button');
    editModule.bindEditButtons(editButtons);

    });

});


// ---- Toast helper ----
function showToast(message, type = 'info', timeout = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `max-w-xs w-auto px-4 py-2 rounded-md shadow-lg text-sm flex items-center gap-3 ${type === 'success' ? 'bg-green-500/10 text-green-700' : type === 'error' ? 'bg-red-500/10 text-red-700' : 'bg-primary/10 text-primary'}`;
    if (typeof message === 'string') toast.textContent = message;
    else if (message instanceof Node) toast.appendChild(message);
    else toast.textContent = String(message);
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 300ms, transform 300ms';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
        setTimeout(() => toast.remove(), 300);
    }, timeout);
}

function showToastWithUndo(message, id, onUndo, timeout = 6000) {
    const btn = document.createElement('button');
    btn.className = 'underline text-sm ml-2';
    btn.textContent = 'Undo';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onUndo();
        // remove the toast immediately
        btn.closest('div')?.remove();
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center';
    const text = document.createElement('span');
    text.textContent = typeof message === 'string' ? message : String(message);
    wrapper.appendChild(text);
    wrapper.appendChild(btn);

    showToast(wrapper, 'info', timeout);
}
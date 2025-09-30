
import createDeleteModule from './deleteProduct.js';
import createEditModule from './btnEdit.js';

document.addEventListener("DOMContentLoaded", () => {
    const btnLoad = document.getElementById("btn-load");
    const productList = document.getElementById("products-list");

    if (!btnLoad || !productList) {
        console.error("❌ No se encontró el botón o el contenedor en el DOM");
        return;
    }

    // Manejar botón "Add Product" usando ID específico
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        console.log('✅ Botón Add Product encontrado');
        addProductBtn.addEventListener('click', () => {
            console.log('🆕 Abriendo modal para agregar producto');
            showAddProductModal();
        });
    } else {
        console.error('❌ No se encontró el botón Add Product con ID add-product-btn');
    }

    // Crear el módulo de edición una sola vez para evitar múltiples listeners en el botón Update
    const editModule = createEditModule({ showToast, reloadList: () => btnLoad.click() });

    btnLoad.addEventListener("click", async () => {
        try {
            console.log('🔄 Cargando productos...');
            // 🔍 Detecta si estamos en local o en producción
            // Usar ruta relativa permite funcionar tanto en dev (localhost:5000) como en producción
            const API_URL = "/products";

            console.log('📡 Haciendo petición a:', API_URL);
            const res = await fetch(API_URL, {
                credentials: 'include' // Importante para enviar cookies de autenticación
            });
            
            console.log('📊 Respuesta del servidor:', res.status, res.statusText);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error HTTP: ${res.status} - ${errorText}`);
            }

            const products = await res.json();
            console.log('✅ Productos recibidos:', products.length, 'productos');

            productList.innerHTML = "";

            products.forEach(product => {
                    const card = document.createElement("div");
                    card.classList.add("product-card", "w-full", "p-4");
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

/**
 * 🆕 MODAL PARA AGREGAR PRODUCTO
 * 
 * Muestra un modal para crear nuevos productos
 */
function showAddProductModal() {
    // Crear modal si no existe
    let modal = document.getElementById('add-product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-product-modal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none z-50';
        modal.innerHTML = `
            <div class="bg-background-light dark:bg-background-dark rounded-xl shadow-lg w-full max-w-md transform transition-transform duration-300 scale-95">
                <div class="p-6">
                    <h3 class="text-lg font-medium mb-4">Agregar Producto</h3>
                    <form id="add-product-form" class="space-y-4">
                        <div>
                            <label class="text-sm text-primary" for="add-prod-name">Nombre del Producto</label>
                            <input
                                class="form-input mt-1 w-full rounded-md border-primary/20 bg-primary/10 dark:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                id="add-prod-name" name="nombre" type="text" required />
                        </div>
                        <div>
                            <label class="text-sm text-primary" for="add-prod-stock">Stock</label>
                            <input
                                class="form-input mt-1 w-full rounded-md border-primary/20 bg-primary/10 dark:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                id="add-prod-stock" name="stock" type="text" required />
                        </div>
                        <div>
                            <label class="text-sm text-primary" for="add-prod-price">Precio</label>
                            <input
                                class="form-input mt-1 w-full rounded-md border-primary/20 bg-primary/10 dark:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                id="add-prod-price" name="price" type="number" step="0.01" required />
                        </div>
                        <div>
                            <label class="text-sm text-primary" for="add-prod-img">URL de Imagen</label>
                            <input
                                class="form-input mt-1 w-full rounded-md border-primary/20 bg-primary/10 dark:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                id="add-prod-img" name="img" type="url" placeholder="https://ejemplo.com/imagen.jpg" />
                        </div>
                    </form>
                </div>
                <div class="bg-primary/5 dark:bg-primary/10 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                    <button id="add-cancel-btn" class="px-4 py-2 text-sm font-medium text-primary bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button id="add-save-btn" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors">
                        Guardar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('add-cancel-btn').addEventListener('click', () => hideAddProductModal());
        document.getElementById('add-save-btn').addEventListener('click', handleAddProduct);
    }
    
    // Mostrar modal
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.transform').classList.remove('scale-95');
    modal.querySelector('.transform').classList.add('scale-100');
    
    // Limpiar formulario
    document.getElementById('add-product-form').reset();
}

function hideAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.querySelector('.transform').classList.remove('scale-100');
        modal.querySelector('.transform').classList.add('scale-95');
    }
}

async function handleAddProduct() {
    const form = document.getElementById('add-product-form');
    const formData = new FormData(form);
    const productData = {
        nombre: formData.get('nombre'),
        stock: formData.get('stock'),
        price: parseFloat(formData.get('price')),
        img: formData.get('img') || 'https://via.placeholder.com/300x300?text=Sin+Imagen'
    };
    
    try {
        const res = await fetch('/products', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al crear producto');
        }
        
        showToast('Producto creado exitosamente', 'success');
        hideAddProductModal();
        
        // Recargar lista de productos
        document.getElementById('btn-load').click();
        
    } catch (error) {
        console.error('Error creando producto:', error);
        showToast(error.message, 'error');
    }
}
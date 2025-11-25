// js/views/seguimiento.view.js

export class SeguimientoView {
    constructor() {
        this.container = document.getElementById('tracking-result');
        this.errorContainer = document.getElementById('tracking-error');
        this.loader = document.getElementById('btn-loader');
        this.btnIcon = document.getElementById('btn-icon');
        this.btn = document.getElementById('btn-track');
        
        // Contenedor para inyectar acciones dinámicas (Subida/Aprobación)
        this.actionsContainer = document.createElement('div');
        this.actionsContainer.id = 'dynamic-actions-area';
        this.actionsContainer.className = 'mt-8 border-t pt-6 animate-fade-in';
    }

    setLoading(isLoading) {
        this.btn.disabled = isLoading;
        if (isLoading) {
            this.btnIcon.classList.add('hidden');
            this.loader.classList.remove('hidden');
            this.container.classList.add('hidden');
            this.errorContainer.classList.add('hidden');
            this.actionsContainer.innerHTML = ''; // Limpiar acciones previas
        } else {
            this.btnIcon.classList.remove('hidden');
            this.loader.classList.add('hidden');
        }
    }

    showError() {
        this.errorContainer.classList.remove('hidden');
    }

    renderResult(order) {
        this.container.classList.remove('hidden');

        // Renderizar Textos Básicos
        document.getElementById('result-client').textContent = order.clientes.razon_social;
        const prodName = (order.orden_items && order.orden_items[0]) ? order.orden_items[0].producto : "Pedido Varios";
        document.getElementById('result-product').textContent = prodName;

        // Renderizar Badge de Estado
        const badge = document.getElementById('result-status-badge');
        badge.textContent = order.estado;
        this.updateBadgeColor(badge, order.estado);

        // Renderizar Barra de Progreso (Lógica existente simplificada)
        // ... (Tu lógica de barra de progreso existente se mantiene igual)

        // Limpiar e insertar contenedor de acciones
        const existingActions = document.getElementById('dynamic-actions-area');
        if (existingActions) existingActions.remove();
        this.container.appendChild(this.actionsContainer);
    }

    updateBadgeColor(badge, status) {
        badge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ';
        if (['Nueva', 'Pendiente'].includes(status)) badge.className += 'bg-blue-100 text-blue-800';
        else if (status === 'En Aprobación de Cliente') badge.className += 'bg-yellow-100 text-yellow-800';
        else if (status === 'Diseño Aprobado') badge.className += 'bg-green-100 text-green-800';
        else if (status === 'Cambios Solicitados') badge.className += 'bg-red-100 text-red-800';
        else badge.className += 'bg-gray-100 text-gray-800';
    }

    // --- NUEVAS VISTAS DINÁMICAS ---

    // 1. Vista para subir archivo (Cliente sube arte)
    renderUploadSection() {
        this.actionsContainer.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                <h3 class="text-lg font-bold text-gray-800 mb-2">Subir Arte / Diseño Original</h3>
                <p class="text-sm text-gray-500 mb-4">Sube tu archivo (PDF, JPG) para iniciar el proceso de pre-prensa.</p>
                
                <input type="file" id="client-file-input" class="hidden" accept=".pdf, .jpg, .jpeg, .png">
                
                <label for="client-file-input" class="inline-block px-6 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 shadow-sm font-medium text-gray-700 transition">
                    <i data-lucide="upload-cloud" class="inline w-5 h-5 mr-2"></i> Seleccionar Archivo
                </label>

                <div id="preview-box" class="hidden mt-4 p-4 bg-white rounded border border-gray-200">
                    <p class="text-xs font-bold text-gray-400 uppercase mb-2">Previsualización antes de enviar:</p>
                    <div id="preview-content" class="flex justify-center mb-3"></div>
                    <button id="btn-confirm-upload" class="px-6 py-2 bg-brand-red text-white font-bold rounded-lg shadow hover:bg-red-700 transition w-full md:w-auto">
                        Confirmar y Enviar
                    </button>
                </div>
            </div>
        `;
        if(window.lucide) window.lucide.createIcons();
    }

    // Mostrar previsualización local del archivo seleccionado
    showLocalPreview(file) {
        const box = document.getElementById('preview-box');
        const content = document.getElementById('preview-content');
        box.classList.remove('hidden');
        
        const url = URL.createObjectURL(file);
        
        if (file.type === 'application/pdf') {
            content.innerHTML = `<embed src="${url}" type="application/pdf" width="100%" height="400px" class="rounded border" />`;
        } else {
            content.innerHTML = `<img src="${url}" class="max-w-full h-auto max-h-96 rounded shadow" />`;
        }
    }

    // 2. Vista para Aprobar/Rechazar (Viene de Pre-Prensa)
    renderApprovalSection(designerFile) {
        if (!designerFile) {
            this.actionsContainer.innerHTML = `<p class="text-center text-gray-500 italic">Esperando archivo de diseño...</p>`;
            return;
        }

        this.actionsContainer.innerHTML = `
            <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 class="text-xl font-bold text-yellow-800 mb-2 flex items-center justify-center">
                    <i data-lucide="alert-circle" class="w-6 h-6 mr-2"></i> Aprobación Requerida
                </h3>
                <p class="text-center text-gray-700 mb-6">Pre-Prensa ha preparado este archivo. Revísalo cuidadosamente.</p>

                <div class="bg-white p-2 rounded shadow-sm border mb-6 h-[500px]">
                    <iframe src="${designerFile.url_archivo}" width="100%" height="100%" class="rounded"></iframe>
                </div>

                <div class="flex flex-col md:flex-row justify-center gap-4" id="decision-buttons">
                    <button id="btn-reject-mode" class="px-6 py-3 bg-white text-red-600 border border-red-200 font-bold rounded-lg hover:bg-red-50 transition">
                        Solicitar Cambios
                    </button>
                    <button id="btn-approve" class="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition">
                        Aprobar Diseño
                    </button>
                </div>

                <div id="reject-form" class="hidden mt-4 animate-fade-in">
                    <textarea id="reject-comment" class="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" rows="3" placeholder="Describe los cambios necesarios..."></textarea>
                    <div class="flex justify-end gap-2 mt-2">
                        <button id="btn-cancel-reject" class="text-gray-500 text-sm hover:underline px-3">Cancelar</button>
                        <button id="btn-confirm-reject" class="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Enviar Correcciones</button>
                    </div>
                </div>
            </div>
        `;
        if(window.lucide) window.lucide.createIcons();
    }
}
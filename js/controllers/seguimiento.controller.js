// js/controllers/seguimiento.controller.js
import { PedidosService } from '../services/pedidos.service.js';
import { SeguimientoView } from '../views/seguimiento.view.js';

class SeguimientoController {
    constructor() {
        this.service = new PedidosService();
        this.view = new SeguimientoView();
        this.form = document.getElementById('tracking-form');
        this.currentPedidoId = null; // Guardamos el ID actual
        
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const otId = document.getElementById('ot-input').value.trim();
        const docId = document.getElementById('doc-input').value.trim();

        this.view.setLoading(true);

        try {
            const pedido = await this.service.buscarPedido(otId, docId);
            
            if (pedido) {
                this.currentPedidoId = pedido.id;
                this.view.renderResult(pedido);
                
                // LÓGICA DE FLUJO SEGÚN ESTADO
                await this.handleFlowByStatus(pedido);
            } else {
                this.view.showError();
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión. Intenta nuevamente.");
        } finally {
            this.view.setLoading(false);
        }
    }

    async handleFlowByStatus(pedido) {
        // CASO 1: Orden Nueva (Cliente debe subir archivo)
        if (pedido.estado === 'Orden creada') {
            this.view.renderUploadSection();
            this.setupUploadEvents();
        } 
        
        // CASO 2: Cliente debe aprobar (Ver archivo de diseñador)
        else if (pedido.estado === 'En Aprobación de Cliente') {
            // Obtener el archivo que subió el diseñador
            const archivoDisenador = await this.service.obtenerArchivoDisenador(pedido.id);
            this.view.renderApprovalSection(archivoDisenador);
            this.setupApprovalEvents();
        }
        
        // Otros casos (Diseño Aprobado, En Producción, etc.) solo muestran el status badge (ya manejado en view)
    }

    // --- EVENT LISTENERS DINÁMICOS ---

    setupUploadEvents() {
        const fileInput = document.getElementById('client-file-input');
        const confirmBtn = document.getElementById('btn-confirm-upload');
        let selectedFile = null;

        // Al seleccionar archivo -> Previsualizar
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedFile = file;
                this.view.showLocalPreview(file);
            }
        });

        // Al confirmar subida
        confirmBtn?.addEventListener('click', async () => {
            if (!selectedFile) return;
            
            confirmBtn.textContent = "Subiendo...";
            confirmBtn.disabled = true;

            try {
                await this.service.subirArteCliente(this.currentPedidoId, selectedFile);
                alert("¡Archivo enviado! Nuestro equipo de pre-prensa comenzará a trabajar.");
                // Recargar para ver nuevo estado
                location.reload(); 
            } catch (error) {
                alert("Error al subir el archivo.");
                confirmBtn.textContent = "Reintentar";
                confirmBtn.disabled = false;
            }
        });
    }

    setupApprovalEvents() {
        const btnApprove = document.getElementById('btn-approve');
        const btnRejectMode = document.getElementById('btn-reject-mode');
        const rejectForm = document.getElementById('reject-form');
        const btnConfirmReject = document.getElementById('btn-confirm-reject');
        const btnCancelReject = document.getElementById('btn-cancel-reject');
        const decisionButtons = document.getElementById('decision-buttons');

        // Modo Rechazo: Mostrar formulario
        btnRejectMode?.addEventListener('click', () => {
            decisionButtons.classList.add('hidden');
            rejectForm.classList.remove('hidden');
        });

        // Cancelar Rechazo
        btnCancelReject?.addEventListener('click', () => {
            rejectForm.classList.add('hidden');
            decisionButtons.classList.remove('hidden');
        });

        // Confirmar Rechazo
        btnConfirmReject?.addEventListener('click', async () => {
            const comentario = document.getElementById('reject-comment').value;
            if (!comentario) return alert("Por favor escribe qué cambios necesitas.");

            btnConfirmReject.textContent = "Enviando...";
            try {
                await this.service.enviarRechazo(this.currentPedidoId, comentario);
                alert("Tus correcciones han sido enviadas al diseñador.");
                location.reload();
            } catch (error) {
                alert("Error al enviar correcciones.");
                btnConfirmReject.textContent = "Reintentar";
            }
        });

        // Aprobar Diseño
        btnApprove?.addEventListener('click', async () => {
            if (!confirm("¿Estás seguro de aprobar el diseño? Pasará directo a producción.")) return;

            btnApprove.textContent = "Procesando...";
            btnApprove.disabled = true;
            try {
                await this.service.enviarAprobacion(this.currentPedidoId);
                alert("¡Gracias! Tu orden ha sido aprobada y pasará a producción.");
                location.reload();
            } catch (error) {
                alert("Error al aprobar.");
                btnApprove.disabled = false;
            }
        });
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new SeguimientoController();
});
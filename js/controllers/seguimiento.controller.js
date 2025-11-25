import { PedidosService } from '../services/pedidos.service.js';
import { SeguimientoView } from '../views/seguimiento.view.js';

class SeguimientoController {
    constructor() {
        this.service = new PedidosService();
        this.view = new SeguimientoView();
        this.form = document.getElementById('tracking-form');
        
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
                this.view.renderResult(pedido);
            } else {
                this.view.showError();
            }
        } catch (error) {
            alert("Error de conexión. Intenta nuevamente.");
        } finally {
            this.view.setLoading(false);
        }
    }
}

// Inicializar controlador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SeguimientoController();
    lucide.createIcons();
});
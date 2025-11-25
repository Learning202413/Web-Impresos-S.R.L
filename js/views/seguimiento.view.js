export class SeguimientoView {
    constructor() {
        this.container = document.getElementById('tracking-result');
        this.errorContainer = document.getElementById('tracking-error');
        this.loader = document.getElementById('btn-loader');
        this.btnIcon = document.getElementById('btn-icon');
        this.btn = document.getElementById('btn-track');
    }

    setLoading(isLoading) {
        this.btn.disabled = isLoading;
        if (isLoading) {
            this.btnIcon.classList.add('hidden');
            this.loader.classList.remove('hidden');
            this.container.classList.add('hidden');
            this.errorContainer.classList.add('hidden');
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

        // Renderizar Textos
        document.getElementById('result-client').textContent = order.clientes.razon_social;
        const prodName = (order.orden_items && order.orden_items[0]) ? order.orden_items[0].producto : "Pedido Varios";
        document.getElementById('result-product').textContent = prodName;

        // Renderizar Badge
        const badge = document.getElementById('result-status-badge');
        badge.textContent = order.estado || 'En Proceso';
        this._updateBadgeColor(badge, order.estado);

        // Actualizar Stepper
        this._updateStepper(order.estado);

        // Mensaje final
        const msg = document.getElementById('result-message');
        this._renderMessage(msg, order.estado);
        
        // Reinicializar iconos si es necesario
        if(window.lucide) window.lucide.createIcons();
    }

    _updateBadgeColor(badge, estado) {
        const status = (estado || '').toLowerCase();
        badge.className = "px-4 py-2 rounded-full text-sm font-bold shadow-sm ";
        if (status.includes('completado')) badge.className += "bg-green-100 text-green-800 border border-green-200";
        else if (status.includes('rechazada')) badge.className += "bg-red-100 text-red-800 border border-red-200";
        else badge.className += "bg-blue-100 text-blue-800 border border-blue-200";
    }

    _renderMessage(element, estado) {
        const status = (estado || '').toLowerCase();
        if (status.includes('completado') || status.includes('listo')) {
            element.innerHTML = `🎉 <strong>¡Listo para entrega!</strong> Puedes recoger tu pedido en Av. Ferrocarril 781.`;
        } else {
            element.innerHTML = `Tu pedido está avanzando en la fase de <strong>${estado}</strong>.`;
        }
    }

    _updateStepper(estado) {
        const status = (estado || '').toLowerCase();
        let step = 1;
        if (status.includes('diseño') || status.includes('pre')) step = 2;
        if (status.includes('prensa') || status.includes('imprimiendo')) step = 3;
        if (status.includes('post') || status.includes('acabado')) step = 4;
        if (status.includes('completado') || status.includes('listo')) step = 5;

        const bar = document.getElementById('progress-bar-line');
        const widths = [0, 0, 25, 50, 75, 100];
        bar.style.width = `${widths[step]}%`;
        
        // Actualizar color de barra
        if (step === 5) bar.className = bar.className.replace('bg-brand-red', 'bg-green-500');
        else bar.className = bar.className.replace('bg-green-500', 'bg-brand-red');

        // Actualizar círculos
        for (let i = 1; i <= 5; i++) {
            const item = document.getElementById(`step-${i}`);
            const circle = item.querySelector('.step-circle');
            const icon = item.querySelector('.icon-step');
            const label = item.querySelector('p');

            // Reset base classes
            circle.className = `w-10 h-10 rounded-full border-4 flex items-center justify-center step-circle relative z-10 transition-all duration-300 shadow-sm`;
            icon.className = `w-5 h-5 icon-step`;
            label.className = `mt-3 text-xs font-bold uppercase`;

            if (i < step) {
                // Completado
                circle.classList.add('bg-green-500', 'border-green-500');
                icon.classList.add('text-white');
                label.classList.add('text-green-600');
            } else if (i === step) {
                // Activo
                circle.classList.add('bg-brand-red', 'border-red-200');
                icon.classList.add('text-white');
                label.classList.add('text-brand-red');
            } else {
                // Pendiente
                circle.classList.add('bg-slate-200', 'border-white');
                icon.classList.add('text-slate-400');
                label.classList.add('text-slate-400');
            }
        }
    }
}

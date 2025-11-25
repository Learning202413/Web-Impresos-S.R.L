import { supabase } from '../core-web/supabase.client.js';

export class PedidosService {
    async buscarPedido(otId, docId) {
        try {
            const { data, error } = await supabase
                .from('ordenes')
                .select(`*, clientes!inner(razon_social, ruc_dni), orden_items(producto)`)
                .or(`ot_id.eq.${otId},codigo.eq.${otId}`)
                .eq('clientes.ruc_dni', docId)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error en servicio de pedidos:', error);
            throw error;
        }
    }
}
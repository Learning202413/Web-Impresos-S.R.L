// js/services/pedidos.service.js
import { supabase } from '../../core-web/supabase.client.js';

export class PedidosService {
    
    // Buscar la orden básica
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

    // NUEVO: Buscar el último archivo enviado por el DISEÑADOR para aprobar
    async obtenerArchivoDisenador(ordenId) {
        try {
            const { data, error } = await supabase
                .from('orden_archivos')
                .select('*')
                .eq('orden_id', ordenId)
                .eq('tipo_emisor', 'DISENADOR')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') throw error; // Ignorar error si no hay datos
            return data;
        } catch (error) {
            console.error('Error obteniendo archivo diseñador:', error);
            return null;
        }
    }

    // NUEVO: Subir el arte inicial del cliente
    async subirArteCliente(ordenId, file) {
        try {
            // 1. Subir a Storage
            const fileName = `${ordenId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('ordenes-files') // IMPORTANTE: Debes crear este bucket en Supabase
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Obtener URL Pública
            const { data: urlData } = supabase.storage
                .from('ordenes-files')
                .getPublicUrl(fileName);

            // 3. Registrar en Base de Datos (orden_archivos)
            const { error: dbError } = await supabase
                .from('orden_archivos')
                .insert({
                    orden_id: ordenId,
                    tipo_emisor: 'CLIENTE',
                    nombre_archivo: file.name,
                    url_archivo: urlData.publicUrl,
                    version: 1
                });

            if (dbError) throw dbError;

            // 4. Actualizar estado de la orden
            await supabase
                .from('ordenes')
                .update({ estado: 'En Pre-prensa' }) // Avanza el flujo
                .eq('id', ordenId);

            return { success: true, url: urlData.publicUrl };

        } catch (error) {
            console.error('Error subiendo arte:', error);
            throw error;
        }
    }

    // NUEVO: Enviar Aprobación
    async enviarAprobacion(ordenId) {
        // Actualiza el estado para que Pre-Prensa pueda generar placas
        return await supabase
            .from('ordenes')
            .update({ estado: 'Diseño Aprobado' })
            .eq('id', ordenId);
    }

    // NUEVO: Enviar Rechazo con Comentario
    async enviarRechazo(ordenId, comentario) {
        try {
            // 1. Guardar comentario en la nueva tabla
            const { error: commentError } = await supabase
                .from('orden_comentarios')
                .insert({
                    orden_id: ordenId,
                    mensaje: comentario,
                    autor: 'CLIENTE'
                });
            
            if (commentError) throw commentError;

            // 2. Devolver estado a corrección
            return await supabase
                .from('ordenes')
                .update({ estado: 'Cambios Solicitados' })
                .eq('id', ordenId);

        } catch (error) {
            console.error('Error enviando rechazo:', error);
            throw error;
        }
    }
}
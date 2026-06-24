// --- US Features: Integración con API del backend ---
// US04 - Dashboard con buscador
// US05 - Listar resultados de búsqueda de tutores
// US10 - Notificación de aceptación (aprendiz)
// US15 - Notificación de solicitud entrante (tutor)
// US16 - Mostrar solicitud con datos del aprendiz
// US24 - Gestionar verificación (aprobar/rechazar)

const API_BASE = 'http://localhost:8080';

const getUsuarioId = () => parseInt(localStorage.getItem('userId') || '1');

// Fetch con timeout de 3 segundos; lanza error si falla (el llamador usa mock)
const apiFetch = async (endpoint, opciones = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
        const res = await fetch(API_BASE + endpoint, {
            ...opciones,
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(timer);
        throw e;
    }
};

// ==========================================
// DATOS MOCK (fallback cuando el backend no está corriendo)
// ==========================================

const mockNotificacionesAceptacion = [
    {
        idNotificacion: 101,
        tipo: 'aceptacion',
        contenido: 'Tu solicitud de tutoría en Python fue aceptada por Ana García',
        leido: false
    },
    {
        idNotificacion: 102,
        tipo: 'aceptacion',
        contenido: 'Tu solicitud de tutoría en Cálculo I fue aceptada por Victor Alberca',
        leido: false
    }
];

const mockSolicitudesTutor = [
    {
        idSolicitud: 1,
        idAprendiz: 2,
        idTutor: 1,
        mensaje: 'Hola! Podemos programar una sesión para el martes? :)',
        estado: 'pendiente',
        fecha: '2025-05-10T10:00:00',
        aprendizNombre: 'Jose Alvarado Jimenez',
        aprendizFoto: '../assets/images/ima-foto-adrian-guevara.png',
        aprendizUniversidad: 'UPC',
        habilidadNombre: 'Cálculo I'
    },
    {
        idSolicitud: 2,
        idAprendiz: 3,
        idTutor: 1,
        mensaje: 'Te envié una solicitud para el curso de Diseño UX.',
        estado: 'pendiente',
        fecha: '2025-05-11T14:00:00',
        aprendizNombre: 'Miguel Santos',
        aprendizFoto: '../assets/images/ima-chico1.png',
        aprendizUniversidad: 'PUCP',
        habilidadNombre: 'Diseño UX'
    }
];

const mockVerificacionesPendientes = [
    {
        idVerificacion: 1,
        idUsuario: 5,
        estado: 'pendiente',
        fecha: '2025-05-02',
        usuario: { nombre: 'Stephano Galvez Cepero', universidad: 'UPC' }
    },
    {
        idVerificacion: 2,
        idUsuario: 6,
        estado: 'pendiente',
        fecha: '2025-05-08',
        usuario: { nombre: 'Carmen Mendoza López', universidad: 'PUCP' }
    },
    {
        idVerificacion: 3,
        idUsuario: 7,
        estado: 'pendiente',
        fecha: '2025-05-09',
        usuario: { nombre: 'Ricardo Flores', universidad: 'UNMSM' }
    },
    {
        idVerificacion: 4,
        idUsuario: 8,
        estado: 'pendiente',
        fecha: '2025-05-10',
        usuario: { nombre: 'Laura Quispe Ramos', universidad: 'U. de Lima' }
    },
    {
        idVerificacion: 5,
        idUsuario: 9,
        estado: 'pendiente',
        fecha: '2025-05-11',
        usuario: { nombre: 'Carlos Mendez Torres', universidad: 'UNMSM' }
    }
];

// ==========================================
// HELPERS COMPARTIDOS
// ==========================================

const actualizarBadgeNotificaciones = () => {
    const badge = document.querySelector('#nav-notificaciones .badge-notificaciones');
    if (!badge) return;
    const total =
        document.querySelectorAll('#lista-notif-solicitudes .notificacion-item').length +
        document.querySelectorAll('#lista-notif-aceptacion .notificacion-item').length;
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
};

const formatearFecha = (fechaStr) => {
    try {
        return new Date(fechaStr).toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return fechaStr || '';
    }
};

// ==========================================
// US10 - Notificaciones de aceptación (aprendiz)
// ==========================================

const cargarNotificacionesAceptacion = async () => {
    const idUsuario = getUsuarioId();
    let notificaciones;

    try {
        const todas = await apiFetch(`/api/notificaciones/usuario/${idUsuario}`);
        notificaciones = todas.filter(n =>
            n.tipo === 'aceptacion' || n.tipo === 'ACEPTACION' || n.tipo === 'aceptada'
        );
    } catch (e) {
        console.warn('[US10] API no disponible, usando datos de ejemplo');
        notificaciones = mockNotificacionesAceptacion;
    }

    const lista = document.getElementById('lista-notif-aceptacion');
    const seccion = document.getElementById('seccion-notif-aceptacion');
    if (!lista || !seccion) return;

    if (notificaciones.length === 0) {
        seccion.style.display = 'none';
        actualizarBadgeNotificaciones();
        return;
    }

    seccion.style.display = 'block';
    lista.innerHTML = '';

    notificaciones.slice(0, 4).forEach(notif => {
        const li = document.createElement('li');
        li.className = 'notificacion-item';
        li.innerHTML = `
            <div class="dash-est-tarjeta-solicitud dropdown-style"
                 style="border-left:3px solid #28a745; background:${notif.leido ? '#fff' : '#f0fff4'}; align-items:flex-start; gap:10px;">
                <div style="background:#28a745; color:white; min-width:36px; height:36px; border-radius:50%;
                            display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">✓</div>
                <div class="dash-est-solicitud-info" style="flex:1;">
                    <p style="margin:0; color:#28a745; font-weight:600; font-size:13px;">Solicitud Aceptada</p>
                    <p style="font-size:12px; margin:2px 0 0; color:#555;">${notif.contenido}</p>
                </div>
                <button class="btn-cerrar-notif"
                        style="background:none; border:none; cursor:pointer; color:#aaa; font-size:16px; flex-shrink:0;"
                        title="Marcar como leída">✕</button>
            </div>
        `;

        li.querySelector('.btn-cerrar-notif').addEventListener('click', async (e) => {
            e.stopPropagation();
            try { await apiFetch(`/api/notificaciones/${notif.idNotificacion}/leer`, { method: 'PUT' }); } catch (err) {}
            li.remove();
            actualizarBadgeNotificaciones();
            if (lista.children.length === 0) seccion.style.display = 'none';
        });

        lista.appendChild(li);
    });

    actualizarBadgeNotificaciones();
};

// ==========================================
// US15 + US16 - Solicitudes con datos del aprendiz (tutor)
// ==========================================

const cargarSolicitudesTutor = async () => {
    const idUsuario = getUsuarioId();
    let solicitudes;

    try {
        const rawSolicitudes = await apiFetch(`/api/solicitudes/tutor/${idUsuario}`);
        const pendientes = rawSolicitudes.filter(s =>
            s.estado === 'pendiente' || s.estado === 'PENDIENTE'
        );
        solicitudes = await Promise.all(pendientes.map(async (sol) => {
            try {
                const aprendiz = await apiFetch(`/api/usuarios/${sol.idAprendiz}`);
                return {
                    ...sol,
                    aprendizNombre: aprendiz.nombreCompleto || 'Aprendiz',
                    aprendizFoto: '../assets/images/ima-foto-usuario.png',
                    aprendizUniversidad: 'Universidad',
                    habilidadNombre: 'Habilidad'
                };
            } catch (err) {
                return {
                    ...sol,
                    aprendizNombre: 'Aprendiz',
                    aprendizFoto: '../assets/images/ima-foto-usuario.png',
                    aprendizUniversidad: 'Universidad',
                    habilidadNombre: ''
                };
            }
        }));
    } catch (e) {
        console.warn('[US15/US16] API no disponible, usando datos de ejemplo');
        solicitudes = mockSolicitudesTutor;
    }

    // US15: Actualizar dropdown de notificaciones
    const listaSolicitudes = document.getElementById('lista-notif-solicitudes');
    if (listaSolicitudes) {
        listaSolicitudes.innerHTML = '';
        if (solicitudes.length === 0) {
            listaSolicitudes.innerHTML = '<li style="padding:10px; color:#666; font-size:13px; text-align:center;">Sin solicitudes pendientes</li>';
        } else {
            solicitudes.slice(0, 3).forEach(sol => {
                listaSolicitudes.appendChild(crearItemSolicitud(sol));
            });
        }
    }

    // US16: Actualizar panel dashboard - sección solicitudes
    const dashSub = document.querySelector('#panel-dashboard-estudiante .dash-est-sub-seccion');
    if (dashSub) {
        const subtituloInfo = dashSub.querySelector('.dash-est-subtitulo-info');
        if (subtituloInfo) {
            const cnt = solicitudes.length;
            subtituloInfo.textContent = `¡Tienes ${cnt} solicitud${cnt !== 1 ? 'es' : ''} pendiente${cnt !== 1 ? 's' : ''}!`;
        }
        dashSub.querySelectorAll('.dash-est-tarjeta-solicitud').forEach(t => t.remove());
        solicitudes.slice(0, 2).forEach(sol => dashSub.appendChild(crearTarjetaDashSolicitud(sol)));
    }

    actualizarBadgeNotificaciones();
};

const crearItemSolicitud = (sol) => {
    const li = document.createElement('li');
    li.className = 'notificacion-item';
    li.innerHTML = `
        <div class="dash-est-tarjeta-solicitud dropdown-style" style="align-items:flex-start;">
            <img src="${sol.aprendizFoto || '../assets/images/ima-foto-usuario.png'}"
                 alt="Foto ${sol.aprendizNombre}"
                 class="dash-est-solicitud-img"
                 style="cursor:pointer;">
            <div class="dash-est-solicitud-info">
                <p style="margin:0;"><strong>${sol.aprendizNombre}</strong></p>
                <p style="font-size:12px; margin:2px 0 0; color:#555;">${sol.mensaje || 'Sin mensaje'}</p>
                ${sol.habilidadNombre
                    ? `<span style="font-size:11px; color:#005a9c; background:#e8f0fe; padding:2px 6px;
                                   border-radius:10px; display:inline-block; margin-top:4px;">${sol.habilidadNombre}</span>`
                    : ''}
            </div>
            <div class="dash-est-solicitud-acciones">
                <button class="dash-est-accion-btn aceptar small btn-us-aceptar" aria-label="Aceptar">✓</button>
                <button class="dash-est-accion-btn rechazar small btn-us-rechazar" aria-label="Rechazar">✕</button>
            </div>
        </div>
    `;

    li.querySelector('.btn-us-aceptar').addEventListener('click', (e) => {
        e.stopPropagation();
        responderSolicitud(sol.idSolicitud, 'aceptada', sol.aprendizNombre, li);
    });
    li.querySelector('.btn-us-rechazar').addEventListener('click', (e) => {
        e.stopPropagation();
        responderSolicitud(sol.idSolicitud, 'rechazada', sol.aprendizNombre, li);
    });

    return li;
};

const crearTarjetaDashSolicitud = (sol) => {
    const div = document.createElement('div');
    div.className = 'dash-est-tarjeta-solicitud';
    div.innerHTML = `
        <img src="${sol.aprendizFoto || '../assets/images/ima-foto-usuario.png'}"
             alt="Foto ${sol.aprendizNombre}"
             class="dash-est-solicitud-img">
        <div class="dash-est-solicitud-info">
            <p><strong>${sol.aprendizNombre}</strong></p>
            <p>${sol.mensaje || 'Sin mensaje'}</p>
            ${sol.habilidadNombre
                ? `<span style="font-size:11px; color:#005a9c;">${sol.habilidadNombre}</span>`
                : ''}
        </div>
        <div class="dash-est-solicitud-acciones">
            <button class="dash-est-accion-btn aceptar btn-us-aceptar" aria-label="Aceptar">✓</button>
            <button class="dash-est-accion-btn rechazar btn-us-rechazar" aria-label="Rechazar">✕</button>
        </div>
    `;

    div.querySelector('.btn-us-aceptar').addEventListener('click', () => {
        responderSolicitud(sol.idSolicitud, 'aceptada', sol.aprendizNombre, div);
    });
    div.querySelector('.btn-us-rechazar').addEventListener('click', () => {
        responderSolicitud(sol.idSolicitud, 'rechazada', sol.aprendizNombre, div);
    });

    return div;
};

const responderSolicitud = async (idSolicitud, nuevoEstado, aprendizNombre, elemento) => {
    const accion = nuevoEstado === 'aceptada' ? 'aceptar' : 'rechazar';
    if (!confirm(`¿Deseas ${accion} la solicitud de ${aprendizNombre}?`)) return;

    try {
        await apiFetch(`/api/solicitudes/${idSolicitud}/estado?estado=${nuevoEstado}`, { method: 'PUT' });
    } catch (e) {
        console.warn('[US15] Simulando respuesta localmente');
    }

    // Generar notificación de aceptación para el aprendiz (US10)
    try {
        const contenido = nuevoEstado === 'aceptada'
            ? 'Tu solicitud de tutoría fue aceptada'
            : 'Tu solicitud de tutoría fue rechazada';
        await apiFetch('/api/notificaciones', {
            method: 'POST',
            body: JSON.stringify({ idUsuario: 2, tipo: nuevoEstado, contenido, leido: false })
        });
    } catch (e) {}

    if (elemento) elemento.remove();
    alert(`Solicitud de ${aprendizNombre} ${nuevoEstado === 'aceptada' ? 'aceptada ✅' : 'rechazada ❌'}`);
    actualizarBadgeNotificaciones();
};

// ==========================================
// US04 + US05 - Búsqueda de tutores con API
// ==========================================

const buscarTutoresDesdeAPI = async (termino) => {
    try {
        const todos = await apiFetch('/api/usuarios');
        return todos
            .filter(u => u.rol === 'tutor' || u.rol === 'TUTOR')
            .filter(u => u.nombreCompleto.toLowerCase().includes(termino.toLowerCase()))
            .map(u => ({
                idUsuario: u.idUsuario,
                nombre: u.nombreCompleto,
                carrera: 'Ingeniería',
                rating: u.reputacionPromedio || 4.0,
                tags: [],
                img: '../assets/images/ima-foto-usuario.png',
                verificado: u.verificado || false
            }));
    } catch (e) {
        return null; // null indica que hay que usar la función mock del estudiante.js
    }
};

const inicializarBusquedaConAPI = () => {
    const inputBusqueda = document.getElementById('input-busqueda-principal');
    const btnBuscar = document.getElementById('btn-buscar-principal');
    if (!btnBuscar || !inputBusqueda) return;

    const contenidoInicial   = document.getElementById('contenido-inicial-busqueda');
    const resultadosWrapper  = document.getElementById('resultados-busqueda-wrapper');
    const listaResultados    = document.getElementById('lista-resultados-dinamica');
    const terminoDisplay     = document.getElementById('termino-buscado-display');
    const msgNoResultados    = document.getElementById('mensaje-no-resultados');

    const ejecutarBusqueda = async (e) => {
        if (e) e.preventDefault();
        const texto = inputBusqueda.value.trim();
        if (!texto) { alert('Por favor ingresa un término de búsqueda.'); return; }
        if (!resultadosWrapper || !listaResultados) return;

        if (contenidoInicial) contenidoInicial.style.display = 'none';
        resultadosWrapper.style.display = 'block';
        if (terminoDisplay) terminoDisplay.textContent = texto;
        listaResultados.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">Buscando...</p>';
        if (msgNoResultados) msgNoResultados.style.display = 'none';

        const resultados = await buscarTutoresDesdeAPI(texto);

        // Si la API no está disponible, delegar a la función mock de estudiante.js
        if (resultados === null) {
            if (typeof realizarBusquedaPrincipal === 'function') realizarBusquedaPrincipal();
            return;
        }

        listaResultados.innerHTML = '';

        if (resultados.length === 0) {
            if (msgNoResultados) msgNoResultados.style.display = 'block';
            return;
        }

        resultados.forEach(tutor => {
            const card = document.createElement('article');
            card.className = 'tarjeta-tutor-dashboard';
            card.innerHTML = `
                <div class="tutor-info">
                    <img src="${tutor.img}" alt="${tutor.nombre}" class="tutor-foto">
                    <div class="tutor-datos">
                        <h3 class="tutor-nombre">
                            ${tutor.nombre}
                            ${tutor.verificado
                                ? '<span style="color:#005a9c; font-size:11px; margin-left:4px;">✓ Verificado</span>'
                                : ''}
                        </h3>
                        <p class="tutor-carrera">${tutor.carrera}</p>
                        <div class="tutor-rating">⭐ ${parseFloat(tutor.rating).toFixed(1)}</div>
                    </div>
                </div>
                <div class="tutor-tags">
                    ${tutor.tags.map(t => `<span class="tag-tutor">${t}</span>`).join('')}
                </div>
                <div class="tutor-acciones">
                    <button class="btn-ver-perfil">Perfil</button>
                    <button class="btn-solicitar">Solicitar</button>
                </div>
            `;

            card.querySelector('.btn-solicitar').addEventListener('click', () => {
                const modal = document.getElementById('modal-solicitud-tutoria');
                const nombreSpan = document.getElementById('nombre-tutor-solicitud');
                if (nombreSpan) nombreSpan.textContent = tutor.nombre;
                if (modal) modal.classList.add('activo');
            });

            card.querySelector('.btn-ver-perfil').addEventListener('click', () => {
                mostrarSeccionEstudiante('panel-perfil-tutor');
            });

            listaResultados.appendChild(card);
        });
    };

    // Reemplazar el listener original del botón con la versión conectada a la API
    const nuevoBtn = btnBuscar.cloneNode(true);
    btnBuscar.parentNode.replaceChild(nuevoBtn, btnBuscar);
    nuevoBtn.addEventListener('click', ejecutarBusqueda);
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') ejecutarBusqueda(e);
    });
};

// ==========================================
// US24 - Gestión de verificaciones (coordinador)
// ==========================================

const cargarVerificacionesPendientes = async () => {
    let verificaciones;
    try {
        const raw = await apiFetch('/api/verificaciones/pendientes');
        verificaciones = await Promise.all(raw.map(async (v) => {
            try {
                const ud = await apiFetch(`/api/verificaciones/estudiantes-verificacion/${v.idUsuario}`);
                return { ...v, usuario: { nombre: ud.nombre || 'Estudiante', universidad: 'Universidad' } };
            } catch (err) {
                return { ...v, usuario: { nombre: 'Estudiante', universidad: 'Universidad' } };
            }
        }));
    } catch (e) {
        console.warn('[US24] API no disponible, usando datos de ejemplo');
        verificaciones = mockVerificacionesPendientes;
    }
    renderizarVerificaciones(verificaciones);
};

const renderizarVerificaciones = (verificaciones) => {
    const lista = document.querySelector('#panel-verificacion .panel-lista-correos');
    if (!lista) return;

    lista.innerHTML = '';

    if (verificaciones.length === 0) {
        lista.innerHTML = `
            <div style="text-align:center; padding:50px; color:#666;">
                <p style="font-size:40px;">✅</p>
                <p>No hay verificaciones pendientes.</p>
            </div>
        `;
        if (typeof mostrarSeccion === 'function') mostrarSeccion('panel-verificacion-vacio');
        return;
    }

    verificaciones.forEach(v => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-correo-item';
        tarjeta.dataset.idVerificacion = v.idVerificacion;

        tarjeta.innerHTML = `
            <input type="checkbox" class="correo-checkbox">
            <img src="../assets/images/ima-foto-usuario.png" alt="Foto de perfil" class="correo-imagen">
            <div class="correo-detalles">
                <p class="correo-nombre">${v.usuario.nombre}</p>
                <p class="correo-universidad">${v.usuario.universidad || ''}</p>
                <p class="correo-fecha">Fecha: ${formatearFecha(v.fecha)}</p>
            </div>
        `;

        tarjeta.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return;
            mostrarDetalleVerificacion(v);
        });

        lista.appendChild(tarjeta);
    });

    // Reconfigurar "Seleccionar todos"
    const master = document.getElementById('seleccionar-todos-coord');
    if (master) {
        const nuevoMaster = master.cloneNode(true);
        master.parentNode.replaceChild(nuevoMaster, master);
        nuevoMaster.addEventListener('change', (e) => {
            document.querySelectorAll('#panel-verificacion .correo-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
    }
};

const mostrarDetalleVerificacion = (v) => {
    const panelVacio = document.getElementById('vista-detalle-vacia');
    const panelLleno = document.getElementById('vista-detalle-llena');
    const contenedor = document.querySelector('.contenido-verificaciones-coord');
    if (!panelLleno) return;

    const h3 = panelLleno.querySelector('.detalle-datos-principales h3');
    if (h3) h3.textContent = v.usuario.nombre;

    const parrafos = panelLleno.querySelectorAll('.detalle-datos-principales p');
    if (parrafos[0]) parrafos[0].innerHTML = `<strong>Universidad:</strong> ${v.usuario.universidad || 'Universidad'}`;
    if (parrafos[1]) parrafos[1].innerHTML = `<strong>Fecha:</strong> ${formatearFecha(v.fecha)}`;

    const estadoBadge = panelLleno.querySelector('.badge-estado');
    if (estadoBadge) { estadoBadge.textContent = 'Pendiente'; estadoBadge.className = 'badge-estado pendiente'; }

    panelLleno.dataset.currentVerifId = v.idVerificacion;
    panelLleno.dataset.currentNombre  = v.usuario.nombre;

    if (panelVacio) panelVacio.style.display = 'none';
    panelLleno.style.display = 'flex';
    if (contenedor) contenedor.classList.add('mostrando-detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const procesarVerificacion = async (estado) => {
    const panelLleno = document.getElementById('vista-detalle-llena');
    if (!panelLleno) return;

    const id     = parseInt(panelLleno.dataset.currentVerifId);
    const nombre = panelLleno.dataset.currentNombre || 'el estudiante';
    if (!id) return;

    const accion = estado === 'aprobada' ? 'aprobar' : 'rechazar';
    if (!confirm(`¿Deseas ${accion} la verificación de ${nombre}?`)) return;

    try {
        await apiFetch(`/api/verificaciones/${id}/estado?estado=${estado}`, { method: 'PUT' });
    } catch (e) {
        console.warn('[US24] Simulando actualización localmente');
    }

    // Remover tarjeta de la lista y cerrar detalle
    const tarjeta = document.querySelector(`[data-id-verificacion="${id}"]`);
    if (tarjeta) tarjeta.remove();

    const panelVacio = document.getElementById('vista-detalle-vacia');
    const contenedor = document.querySelector('.contenido-verificaciones-coord');
    panelLleno.style.display = 'none';
    if (panelVacio) panelVacio.style.display = 'flex';
    if (contenedor) contenedor.classList.remove('mostrando-detalle');

    alert(`Verificación de ${nombre} ${estado === 'aprobada' ? 'aprobada ✅' : 'rechazada ❌'}`);

    const restantes = document.querySelectorAll('#panel-verificacion .tarjeta-correo-item');
    if (restantes.length === 0 && typeof mostrarSeccion === 'function') {
        mostrarSeccion('panel-verificacion-vacio');
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const esEstudiante   = !!document.getElementById('panel-dashboard-estudiante');
    const esCoordinador  = !!document.getElementById('panel-verificacion');

    // --- Página del Estudiante ---
    if (esEstudiante) {

        // US04 + US05: Búsqueda con API
        inicializarBusquedaConAPI();

        // US10: Notificaciones de aceptación
        cargarNotificacionesAceptacion();

        // US15 + US16: Solicitudes entrantes con datos del aprendiz
        cargarSolicitudesTutor();

        // Refrescar notificaciones cada 30 segundos
        setInterval(() => {
            cargarNotificacionesAceptacion();
            cargarSolicitudesTutor();
        }, 30000);
    }

    // --- Página del Coordinador ---
    if (esCoordinador) {

        // US24: Cargar verificaciones desde la API
        cargarVerificacionesPendientes();

        // Botón Aceptar en el detalle
        const btnAceptarDetalle = document.querySelector('.panel-detalle-completo-coord .btn-accion-detalle.aceptar');
        if (btnAceptarDetalle) {
            const nuevoAceptar = btnAceptarDetalle.cloneNode(true);
            btnAceptarDetalle.parentNode.replaceChild(nuevoAceptar, btnAceptarDetalle);
            nuevoAceptar.addEventListener('click', () => procesarVerificacion('aprobada'));
        }

        // Botón Rechazar en el detalle
        const btnRechazarDetalle = document.querySelector('.panel-detalle-completo-coord .btn-accion-detalle.rechazar');
        if (btnRechazarDetalle) {
            const nuevoRechazar = btnRechazarDetalle.cloneNode(true);
            btnRechazarDetalle.parentNode.replaceChild(nuevoRechazar, btnRechazarDetalle);
            nuevoRechazar.addEventListener('click', () => procesarVerificacion('rechazada'));
        }

        // Acción masiva: Aceptar seleccionados
        const btnAceptarMasivo = document.querySelector('.barra-acciones-coord .boton-accion-coord.aceptar');
        if (btnAceptarMasivo) {
            const nuevoAceptarM = btnAceptarMasivo.cloneNode(true);
            btnAceptarMasivo.parentNode.replaceChild(nuevoAceptarM, btnAceptarMasivo);
            nuevoAceptarM.addEventListener('click', async (e) => {
                e.preventDefault();
                const seleccionados = [...document.querySelectorAll('#panel-verificacion .correo-checkbox:checked')];
                if (seleccionados.length === 0) { alert('Selecciona al menos un estudiante para aceptar.'); return; }
                if (!confirm(`¿Aceptar ${seleccionados.length} verificación(es)?`)) return;

                for (const cb of seleccionados) {
                    const tarjeta = cb.closest('.tarjeta-correo-item');
                    const verif_id = parseInt(tarjeta?.dataset.idVerificacion);
                    try { await apiFetch(`/api/verificaciones/${verif_id}/estado?estado=aprobada`, { method: 'PUT' }); } catch (err) {}
                    if (tarjeta) tarjeta.remove();
                }

                alert(`${seleccionados.length} verificación(es) aprobada(s) ✅`);
                if (!document.querySelector('#panel-verificacion .tarjeta-correo-item') && typeof mostrarSeccion === 'function') {
                    mostrarSeccion('panel-verificacion-vacio');
                }
            });
        }

        // Acción masiva: Rechazar seleccionados
        const btnRechazarMasivo = document.querySelector('.barra-acciones-coord .boton-accion-coord.rechazar');
        if (btnRechazarMasivo) {
            const nuevoRechazarM = btnRechazarMasivo.cloneNode(true);
            btnRechazarMasivo.parentNode.replaceChild(nuevoRechazarM, btnRechazarMasivo);
            nuevoRechazarM.addEventListener('click', async (e) => {
                e.preventDefault();
                const seleccionados = [...document.querySelectorAll('#panel-verificacion .correo-checkbox:checked')];
                if (seleccionados.length === 0) { alert('Selecciona al menos un estudiante para rechazar.'); return; }
                if (!confirm(`¿Rechazar ${seleccionados.length} verificación(es)?`)) return;

                for (const cb of seleccionados) {
                    const tarjeta = cb.closest('.tarjeta-correo-item');
                    const verif_id = parseInt(tarjeta?.dataset.idVerificacion);
                    try { await apiFetch(`/api/verificaciones/${verif_id}/estado?estado=rechazada`, { method: 'PUT' }); } catch (err) {}
                    if (tarjeta) tarjeta.remove();
                }

                alert(`${seleccionados.length} verificación(es) rechazada(s) ❌`);
                if (!document.querySelector('#panel-verificacion .tarjeta-correo-item') && typeof mostrarSeccion === 'function') {
                    mostrarSeccion('panel-verificacion-vacio');
                }
            });
        }
    }
});

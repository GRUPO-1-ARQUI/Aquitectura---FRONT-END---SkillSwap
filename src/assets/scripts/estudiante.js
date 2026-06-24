// --- Script COMPLETO CORREGIDO para la página de Estudiante ---

// 1. Función para cambiar de sección (Panel)
function mostrarSeccionEstudiante(idSeccionAMostrar) {
    // Ocultar todas las secciones activas
    document.querySelectorAll('.panel-seccion').forEach(seccion => {
      seccion.classList.remove('activa');
    });
    
    // Mostrar la sección deseada
    const seccion = document.getElementById(idSeccionAMostrar);
    if (seccion) {
      seccion.classList.add('activa');
      // Scrollear arriba al cambiar de sección
      window.scrollTo(0, 0);
    } else {
        console.warn("No se encontró la sección:", idSeccionAMostrar);
    }
}

// 2. Función para botones de opción (Perfil - Estado, Días, Tipo)
function setupToggleButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const toggleType = container.dataset.toggle; // 'single' o 'multiple'
    const buttons = container.querySelectorAll('.boton-toggle');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (toggleType === 'single') {
                buttons.forEach(btn => btn.classList.remove('activo'));
                e.target.classList.add('activo');
            } else if (toggleType === 'multiple') {
                e.target.classList.toggle('activo');
            }
        });
    });
}

// 3. Función para editar texto (Perfil - Lápiz/Guardar)
function setupEditableField(button) {
    const targetId = button.dataset.target;
    if (!targetId) return;
    const field = document.getElementById(targetId);
    if (!field) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      const isEditable = field.isContentEditable;
      
      if (isEditable) {
        // Guardar
        field.contentEditable = false;
        field.classList.remove('editable-field-active');
        button.textContent = '✎'; 
        button.title = 'Editar';
      } else {
        // Editar
        field.contentEditable = true;
        field.classList.add('editable-field-active');
        button.textContent = '💾'; 
        button.title = 'Guardar';
        field.focus(); 
      }
    });
}


// ==============================================================
// INICIO: Ejecución al cargar el DOM
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- A. GESTIÓN DEL MODO OSCURO (Sincronizado) ---
  const togglePerfil = document.getElementById('theme-toggle'); // Switch en perfil
  const toggleAjustes = document.getElementById('theme-toggle-ajustes'); // Switch en ajustes

  function aplicarModoOscuro(activar) {
      if (activar) {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark-mode');
      } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light-mode');
      }
      // Sincronizar ambos interruptores si existen
      if(togglePerfil) togglePerfil.checked = activar;
      if(toggleAjustes) toggleAjustes.checked = activar;
  }

  // 1. Cargar preferencia guardada
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark-mode') {
      aplicarModoOscuro(true);
  }

  // 2. Event Listeners para los switches
  if (togglePerfil) {
      togglePerfil.addEventListener('change', function() { aplicarModoOscuro(this.checked); });
  }
  if (toggleAjustes) {
      toggleAjustes.addEventListener('change', function() { aplicarModoOscuro(this.checked); });
  }


  // --- B. NAVEGACIÓN PRINCIPAL (Barra Superior) ---
  const mapNav = {
      'nav-mis-tutores': 'panel-tutores',
      'nav-sesiones': 'panel-sesiones',
      'nav-buscar': 'panel-buscar',
      'nav-perfil': 'panel-perfil',
      'nav-aprender': 'panel-buscar' // Botón amarillo del dashboard
  };

  for (const [idBtn, idPanel] of Object.entries(mapNav)) {
      const btn = document.getElementById(idBtn);
      if (btn) {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              mostrarSeccionEstudiante(idPanel);
          });
      }
  }


  // --- C. NAVEGACIÓN DE AJUSTES (Sidebar e ir/volver) ---
  
  // 1. Botón "⚙ Ajustes" en el Perfil -> Abre Apariencia
  const btnAbrirAjustes = document.querySelector('.btn-ajustes');
  if (btnAbrirAjustes) {
      btnAbrirAjustes.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-ajustes-apariencia');
      });
  }

  // 2. Navegación interna entre Apariencia y Chat
  const btnIrChat = document.getElementById('btn-ir-chat-desde-apariencia');
  if (btnIrChat) {
      btnIrChat.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-ajustes-chat');
      });
  }

  const btnIrApariencia = document.getElementById('btn-ir-apariencia-desde-chat');
  if (btnIrApariencia) {
      btnIrApariencia.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-ajustes-apariencia');
      });
  }

  // 3. Botones "Volver al Perfil"
  const btnVolver1 = document.getElementById('btn-volver-perfil-1'); // En Apariencia
  if (btnVolver1) {
      btnVolver1.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-perfil');
      });
  }

  const btnVolver2 = document.getElementById('btn-volver-perfil-2'); // En Chat
  if (btnVolver2) {
      btnVolver2.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-perfil');
      });
  }


  // --- D. LÓGICA DEL PERFIL (Campos y Botones) ---
  setupToggleButtons('btn-group-estado');
  setupToggleButtons('btn-group-dias');
  setupToggleButtons('btn-group-tipo');
  document.querySelectorAll('.btn-edit-field').forEach(setupEditableField);

  // Botones '+' (Agregar Habilidad/Dominio)
  const btnAddHabilidades = document.querySelector('.habilidades .agregar');
  if (btnAddHabilidades) {
      btnAddHabilidades.addEventListener('click', (e) => { 
          e.preventDefault(); 
          mostrarSeccionEstudiante('panel-add-habilidades'); 
      });
  }

  const btnAddDominio = document.querySelector('.temas-dominio .agregar');
  if (btnAddDominio) {
      btnAddDominio.addEventListener('click', (e) => { 
          e.preventDefault(); 
          mostrarSeccionEstudiante('panel-add-dominio'); 
      });
  }

  // --- Lógica para agregar habilidades desde el SELECT ---
  const btnGuardarHabilidad = document.querySelector('#btn-guardar-habilidad');

  if (btnGuardarHabilidad) {
      btnGuardarHabilidad.addEventListener('click', () => {

          const selectH = document.querySelector('#habilidades-select');
          const listaPerfilH = document.querySelector('.habilidades ul');
          const liAgregarH = document.querySelector('.habilidades .agregar'); // el botón ➕

          if (!selectH) return;

          // Obtener habilidades seleccionadas
          const seleccionadas = [...selectH.selectedOptions].map(opt => opt.text.trim());

          if (seleccionadas.length === 0) {
              alert("Selecciona al menos una habilidad.");
              return;
          }

          seleccionadas.forEach(texto => {
              // Evitar duplicados
              const existe = [...listaPerfilH.querySelectorAll('li')]
                  .some(li => li.textContent.trim().toLowerCase() === texto.toLowerCase());

              if (!existe) {
                  // Crear <li> nuevo
                  const nuevoLi = document.createElement('li');
                  nuevoLi.textContent = texto;

                  // Insertarlo antes del botón +
                  listaPerfilH.insertBefore(nuevoLi, liAgregarH);
              }
          });

          // Regresar al perfil del estudiante
          mostrarSeccionEstudiante('panel-perfil');
      });
  }


  // ==============================================================
  // GESTIÓN DE TEMAS DE DOMINIO (SCENARIO 1 & 2)
  // ==============================================================

  // 1. Estado inicial
  let misTemas = JSON.parse(localStorage.getItem('userTemas')) || ["Figma", "Algoritmos", "SQL"];

  // Referencias al DOM
  const listaPerfilDominio = document.getElementById('lista-dominio-perfil');
  const contenedorEdicionDominio = document.getElementById('contenedor-dominio-edicion');
  const selectTemas = document.getElementById('temas-select');
  const btnGuardarTema = document.getElementById('btn-guardar-tema');
  // Nota: El botón de ir a la sección "btn-add-dominio" ya tiene su listener en la navegación general o arriba.

  // 2. Función de renderizado (Dibuja en ambos lados)
  function renderizarTemas() {
      // A. Renderizar en el PERFIL (Solo texto)
      if (listaPerfilDominio) {
          const btnAgregar = listaPerfilDominio.querySelector('.agregar');
          listaPerfilDominio.innerHTML = ''; // Limpiar

          misTemas.forEach((tema) => {
              const li = document.createElement('li');
              li.textContent = tema;
              listaPerfilDominio.appendChild(li);
          });

          // Volver a poner el botón "+" al final
          if (btnAgregar) listaPerfilDominio.appendChild(btnAgregar);
          
          // Reactivar el clic del botón "+"
          const nuevoBtnAdd = listaPerfilDominio.querySelector('.agregar');
          if(nuevoBtnAdd) {
              nuevoBtnAdd.addEventListener('click', () => mostrarSeccionEstudiante('panel-add-dominio'));
          }
      }

      // B. Renderizar en el PANEL DE EDICIÓN (Con la X para eliminar)
      if (contenedorEdicionDominio) {
          contenedorEdicionDominio.innerHTML = ''; // Limpiar
          
          misTemas.forEach((tema, index) => {
              const span = document.createElement('span');
              span.className = 'dominio-tag'; // Usamos tu estilo CSS existente
              span.style.marginRight = '10px';
              span.style.marginBottom = '10px';
              span.style.display = 'inline-flex';
              span.style.alignItems = 'center';

              // HTML con el nombre y la X roja
              span.innerHTML = `${tema} <b class="btn-eliminar-tema" data-index="${index}" style="cursor:pointer; margin-left:8px; color: #ffcccc; font-weight:bold;">✕</b>`;
              
              contenedorEdicionDominio.appendChild(span);
          });

          // Asignar evento eliminar a cada X
          document.querySelectorAll('.btn-eliminar-tema').forEach(btn => {
              btn.addEventListener('click', (e) => {
                  const index = e.target.dataset.index;
                  eliminarTema(index);
              });
          });
      }
  }

  // 3. Agregar temas desde el Select
  function agregarTemasSeleccionados() {
      if (!selectTemas) return;
      
      // Obtenemos el TEXTO de la opción (ej: "Matemática básica"), no el value ("matematica")
      const opciones = Array.from(selectTemas.selectedOptions).map(o => o.text.trim());

      if (opciones.length === 0) {
          alert("Selecciona al menos un tema.");
          return;
      }

      let count = 0;
      opciones.forEach(tema => {
          if (!misTemas.includes(tema)) { // Evitar duplicados
              misTemas.push(tema);
              count++;
          }
      });

      if (count > 0) {
          guardarYActualizarTemas();
          selectTemas.value = ""; // Limpiar selección
          alert(`Se agregaron ${count} temas correctamente.`);
      } else {
          alert("Ya tienes esos temas en tu lista.");
      }
  }

  // 4. Eliminar tema
  function eliminarTema(index) {
      misTemas.splice(index, 1);
      guardarYActualizarTemas();
  }

  // 5. Guardar y actualizar vista
  function guardarYActualizarTemas() {
      localStorage.setItem('userTemas', JSON.stringify(misTemas));
      renderizarTemas();
  }

  // 6. Evento del botón Guardar
  if (btnGuardarTema) {
      // Asegúrate de borrar cualquier listener anterior clonando el nodo o simplemente asegurando que este código corra una vez
      btnGuardarTema.addEventListener('click', (e) => {
          e.preventDefault();
          agregarTemasSeleccionados();
      });
  }

  // Inicializar al cargar
  renderizarTemas();

  // --- E. TEMAS DE COLOR (Ajustes de Apariencia) ---
  const colorButtons = document.querySelectorAll('.btn-color');
  
  // Recuperar tema guardado
  const savedColorTheme = localStorage.getItem('colorTheme');
  if (savedColorTheme) {
      document.body.classList.add(savedColorTheme);

      const btnAgregarTema = document.querySelector('.dominio-tag-agregar');

      // Actualizar selección visual
      const colorName = savedColorTheme.replace('theme-', '');
      const activeBtn = document.querySelector(`.btn-color[data-color="${colorName}"]`);
      if(activeBtn) {
          document.querySelector('.btn-color.selected')?.classList.remove('selected');
          activeBtn.classList.add('selected');
      }
  }

  colorButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
          // 1. Quitar selección anterior
          document.querySelector('.btn-color.selected')?.classList.remove('selected');
          // 2. Marcar nuevo
          e.target.classList.add('selected');

          // 3. Limpiar clases previas del body
          document.body.classList.remove('theme-pink', 'theme-lightblue', 'theme-orange');

          // 4. Aplicar nuevo
          const color = e.target.dataset.color;
          if (color !== 'default') {
              const themeClass = `theme-${color}`;
              document.body.classList.add(themeClass);
              localStorage.setItem('colorTheme', themeClass);
          } else {
              localStorage.removeItem('colorTheme'); // Default no se guarda
          }
      });
  });


  // --- F. RESPUESTAS RÁPIDAS (Ajustes de Chat) ---
  
  // 1. Referencias a elementos (usando IDs específicos)
  const inputReply = document.getElementById('input-quick-reply');
  const btnAddReply = document.getElementById('btn-add-reply');
  const listReply = document.getElementById('lista-respuestas-rapidas');
  const noRepliesMsg = document.getElementById('no-replies-msg');

  // 2. Cargar datos guardados
  let quickReplies = JSON.parse(localStorage.getItem('quickReplies')) || [
      "¡Hola! Estoy listo para la sesión.",
      "Gracias por tu ayuda.",
      "¿Podemos reagendar?"
  ];

  // 3. Función para dibujar la lista
  function renderReplies() {
      if (!listReply) return;
      listReply.innerHTML = ''; // Limpiar lista actual
      
      if (quickReplies.length === 0) {
          if(noRepliesMsg) noRepliesMsg.style.display = 'block';
      } else {
          if(noRepliesMsg) noRepliesMsg.style.display = 'none';
          
          quickReplies.forEach((text, index) => {
              const li = document.createElement('li');
              // Creamos el contenido del li
              li.innerHTML = `
                  <span>${text}</span>
                  <span class="btn-delete-reply" data-index="${index}" title="Eliminar" style="cursor:pointer; color:red; font-weight:bold;">✖</span>
              `;
              listReply.appendChild(li);
          });

          // Añadir eventos de borrado a los nuevos botones X
          document.querySelectorAll('.btn-delete-reply').forEach(btn => {
              btn.addEventListener('click', (e) => {
                  e.stopPropagation(); // Evitar burbujeo
                  const index = e.target.dataset.index;
                  deleteReply(index);
              });
          });
      }
  }

  // 4. Función para borrar
  function deleteReply(index) {
      quickReplies.splice(index, 1);
      localStorage.setItem('quickReplies', JSON.stringify(quickReplies));
      renderReplies();
  }

  // 5. Función para añadir (separada para poder reutilizarla)
  function addNewReply() {
      if (!inputReply) return;
      
      const text = inputReply.value.trim();
      if (text) {
          quickReplies.push(text);
          localStorage.setItem('quickReplies', JSON.stringify(quickReplies));
          inputReply.value = ''; // Limpiar input
          renderReplies();
          console.log("Respuesta agregada:", text);
      } else {
          alert("Por favor escribe algo antes de agregar.");
      }
  }

  // 6. Inicialización y Listeners
  if (listReply) {
      renderReplies(); // Mostrar lista al cargar

      if (btnAddReply) {
          btnAddReply.addEventListener('click', (e) => {
              e.preventDefault(); // Prevenir submit
              addNewReply();
          });
      }

      if (inputReply) {
          // Permitir agregar presionando "Enter"
          inputReply.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewReply();
              }
          });
      }
  }  //por si acaso pondre un comentario porque eso es el que cambie

      // ---LÓGICA DE TARJETAS DE TUTORES ---

  // Interactividad del Corazón(favoritos)
  const corazones = document.querySelectorAll('.icono-corazon');
  
  corazones.forEach(corazon => {
      corazon.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // IMPORTANTE: Evita que el clic active la tarjeta entera
          
          // Alternar la clase 'favorito' para cambiar el color
          corazon.classList.toggle('favorito');
      });
  });

  // Clic en la tarjeta de Victor 
  const cardVictor = document.getElementById('card-tutor-victor');
  
  if (cardVictor) {
      cardVictor.addEventListener('click', (e) => {
          e.preventDefault();
          // Usamos tu función para navegar al panel del perfil detallado
          mostrarSeccionEstudiante('panel-perfil-tutor');
      });
  }
  //aca quité una llave de cierre porque creo que no iba ahi vamos a ver si funciona 


  // ---LÓGICA DEL PERFIL DE TUTOR ---

  // Corazón (Favorito) en el perfil grande
  const btnFavPerfil = document.getElementById('btn-fav-perfil-tutor');
  if (btnFavPerfil) {
      btnFavPerfil.addEventListener('click', (e) => {
          e.preventDefault();
          // Alternar la clase 'favorito' para cambiar el color a rojo
          btnFavPerfil.classList.toggle('favorito');
      });
  }

  //Botón Solicitar Tutoría -> Ir al Chat con Victor
  const btnSolicitarA = document.getElementById('btn-solicitar-tutoria');
  const btnSolicitarT = document.getElementById('btn-aceptar-tutoria');
  const chatNombreA = document.getElementById('chat-nombre-usuario-a');
  const chatFotoA = document.getElementById('chat-foto-usuario-a');
  const chatNombreT = document.getElementById('chat-nombre-usuario-t');
  const chatFotoT = document.getElementById('chat-foto-usuario-t');

  if (btnSolicitarA) {
      btnSolicitarA.addEventListener('click', (e) => {
          e.preventDefault();
          
          // A. Cambiar los datos del chat para que parezca Victor
          if (chatNombreA) chatNombreA.textContent = "Victor Alberca Saavedra";
          if (chatFotoA) chatFotoA.src = "../assets/images/ima-foto-victor.png";

          // Redirigir a la sección de chat
          mostrarSeccionEstudiante('panel-chat-aprendiz');
      });
  }

  if (btnSolicitarT) {
    btnSolicitarT.addEventListener('click',(e)=>{
      e.preventDefault();

      // A. Cambiar los datos del chat para que parezca Jose
          if (chatNombreT) chatNombreT.textContent = "Jose Alvarado Jimenez";
          if (chatFotoT) chatFotoT.src = "../assets/images/ima-foto-adrian-guevara.png";

          // Redirigir a la sección de chat
          mostrarSeccionEstudiante('panel-chat-tutor');
    });
  }

  // --- NOTIFICACIONES (Dropdown) ---
  const navNotificaciones = document.getElementById('nav-notificaciones');
  const dropdownNotificaciones = document.getElementById('dropdown-notificaciones');

  if (navNotificaciones && dropdownNotificaciones) {
      // 1. Alternar visibilidad al hacer clic en la campana
      navNotificaciones.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Evita que el clic se propague al document
          dropdownNotificaciones.classList.toggle('activo');
      });

      // 2. Cerrar el dropdown si se hace clic fuera de él
      document.addEventListener('click', (e) => {
          // Si el clic NO fue dentro del dropdown Y NO fue en la campana
          if (!dropdownNotificaciones.contains(e.target) && !navNotificaciones.contains(e.target)) {
              dropdownNotificaciones.classList.remove('activo');
          }
      });
      
      // 3. Evitar que clics dentro del dropdown lo cierren
      dropdownNotificaciones.addEventListener('click', (e) => {
           e.stopPropagation();
      });
  }

  // --- Lógica de Videollamada (Desde el Chat) ---
  
  const btnVideoCallA = document.getElementById('btn-iniciar-videollamada-a');
  
  if (btnVideoCallA) {
      btnVideoCallA.addEventListener('click', (e) => {
          e.preventDefault();
          // Navegar a la sección de videollamada
          mostrarSeccionEstudiante('panel-videollamada-a');
          
          // (Opcional) Podrías simular que la llamada "inicia" cargando datos
          console.log("Iniciando videollamada...");
      });
  }

  const btnVideoCallT = document.getElementById('btn-iniciar-videollamada-t');
  
  if (btnVideoCallT) {
      btnVideoCallT.addEventListener('click', (e) => {
          e.preventDefault();
          // Navegar a la sección de videollamada
          mostrarSeccionEstudiante('panel-videollamada-t');
          
          // (Opcional) Podrías simular que la llamada "inicia" cargando datos
          console.log("Iniciando videollamada...");
      });
  }

// --- VIDEOLLAMADA (Colgar -> Ir a Calificar) ---
  const btnColgarA = document.getElementById('btn-colgar-llamada-a');
  
  if (btnColgarA) {
      btnColgarA.addEventListener('click', (e) => {
          e.preventDefault();
          
          if(confirm("¿Deseas finalizar la llamada?")) {
              // CAMBIO: Ahora redirige a la sección de calificación
              mostrarSeccionEstudiante('panel-calificar-a');
          }
      });
  }

  const btnColgarT = document.getElementById('btn-colgar-llamada-t');
  
  if (btnColgarT) {
      btnColgarT.addEventListener('click', (e) => {
          e.preventDefault();
          
          if(confirm("¿Deseas finalizar la llamada?")) {
              // CAMBIO: Ahora redirige a la sección de calificación
              mostrarSeccionEstudiante('panel-calificar-t');
          }
      });
  }

  // --- VIDEOLLAMADA (Pizarra y Chat) ---
  
  // Pizarra
  const btnPizarra = document.getElementById('btn-toggle-pizarra');
  const pizarraOverlay = document.getElementById('pizarra-overlay');
  
  if (btnPizarra && pizarraOverlay) {
      btnPizarra.addEventListener('click', (e) => {
          e.preventDefault();
          // Mostrar/Ocultar Pizarra
          pizarraOverlay.classList.toggle('activa');
          // Marcar botón como activo
          btnPizarra.classList.toggle('activo');
      });
  }

  // Chat Lateral
  const btnChatVideo = document.getElementById('btn-toggle-chat-llamada');
  const panelChatVideo = document.getElementById('panel-chat-llamada');
  const btnCerrarChatVideo = document.getElementById('btn-cerrar-chat-llamada');

  if (btnChatVideo && panelChatVideo) {
      btnChatVideo.addEventListener('click', (e) => {
          e.preventDefault();
          panelChatVideo.classList.toggle('activo');
          btnChatVideo.classList.toggle('activo');
      });
  }

  // Botón cerrar (la X dentro del chat)
  if (btnCerrarChatVideo && panelChatVideo) {
      btnCerrarChatVideo.addEventListener('click', (e) => {
          e.preventDefault();
          panelChatVideo.classList.remove('activo');
          if(btnChatVideo) btnChatVideo.classList.remove('activo');
      });
  }

// ==========================================
// LÓGICA: CRÉDITOS Y CALIFICACIÓN (MEJORADA)
// ==========================================

// 1. Referencias a los elementos del HTML
const displayCreditos = document.getElementById('perfil-creditos-valor');
const displayEstrellas = document.getElementById('perfil-estrellas-visual');
const displayRatingTexto = document.getElementById('perfil-rating-texto');

// 2. Cargar datos guardados (o iniciar en 0 si es nuevo)
let misCreditos = parseInt(localStorage.getItem('userCreditos')) || 0;
let miRating = parseFloat(localStorage.getItem('userRating')) || 0; // Tu promedio actual
let numEvaluaciones = parseInt(localStorage.getItem('userEvaluaciones')) || 0; // Cuántas veces te han calificado

// 3. Función para pintar la información en el perfil
function actualizarStatsPerfil() {
    // A. Actualizar Créditos
    if (displayCreditos) {
        displayCreditos.textContent = misCreditos;
    }

    // B. Actualizar Estrellas (Reputación)
    if (displayEstrellas && displayRatingTexto) {
        if (numEvaluaciones === 0) {
            // Usuario nuevo: Muestra estrellas vacías
            displayEstrellas.textContent = "☆☆☆☆☆";
            displayRatingTexto.textContent = "(Nuevo)";
        } else {
            // Usuario con calificaciones: Calcula estrellas llenas
            const estrellasLlenas = Math.round(miRating); 
            let estrellasStr = '';
            
            // Dibujar: ★ llenas y ☆ vacías
            for (let i = 0; i < 5; i++) {
                if (i < estrellasLlenas) estrellasStr += '★';
                else estrellasStr += '☆';
            }
            
            displayEstrellas.textContent = estrellasStr;
            displayRatingTexto.textContent = `(${miRating.toFixed(1)} de ${numEvaluaciones} opiniones)`;
        }
    }
}

// Ejecutar al cargar la página para que se vea el estado actual
actualizarStatsPerfil();


/**
 * Función principal: Procesa tu calificación al tutor y SIMULA la respuesta.
 */
function procesarCalificacion(nombreInputRadio) {
    // Verificar qué estrella marcó el usuario
    const estrellaSeleccionada = document.querySelector(`input[name="${nombreInputRadio}"]:checked`);
    
    if (!estrellaSeleccionada) {
        alert("Por favor selecciona una puntuación.");
        return;
    }

    const valorCalificacion = parseInt(estrellaSeleccionada.value);
    let mensaje = "¡Gracias por tu feedback!";
    
    // --- PARTE 1: LÓGICA DE CRÉDITOS ---
    // Si tú das 5 estrellas, ganas 1 crédito
    if (valorCalificacion === 5) {
        misCreditos++; 
        localStorage.setItem('userCreditos', misCreditos);
        mensaje = "🌟 ¡Excelente sesión!\n🪙 ¡Has ganado 1 crédito por tu buena participación!";
    }
    
    alert(mensaje);
    
    // Volver al dashboard principal
    mostrarSeccionEstudiante('panel-dashboard-estudiante');
    
    // Limpiar la selección de estrellas
    estrellaSeleccionada.checked = false;

    // --- PARTE 2: NUEVA LÓGICA (SIMULACIÓN DE RESPUESTA) ---
    // Esperamos 2 segundos para simular que el tutor te califica de vuelta
    setTimeout(() => {
        // Generamos una nota aleatoria entre 4 y 5 (para que siempre te vaya bien)
        const notaRecibida = Math.floor(Math.random() * 2) + 4; 
        
        // Recalcular tu promedio
        // Fórmula: (PromedioActual * CantidadAnterior + NuevaNota) / NuevaCantidad
        let nuevoPromedio = ((miRating * numEvaluaciones) + notaRecibida) / (numEvaluaciones + 1);
        
        // Actualizar variables en memoria y guardarlas
        miRating = nuevoPromedio;
        numEvaluaciones++;

        localStorage.setItem('userRating', miRating);
        localStorage.setItem('userEvaluaciones', numEvaluaciones);

        // Actualizar la vista del perfil automáticamente
        actualizarStatsPerfil();

        // Avisar al usuario con una alerta
        alert(`🔔 Notificación:\n¡El tutor también te ha calificado!\nHas recibido ${notaRecibida} estrellas.\nTu reputación ha subido.`);
        
    }, 2000); // 2000ms = 2 segundos de espera
}

// 4. Asignar esta función a los botones de enviar
const btnEnviarCalifA = document.getElementById('btn-enviar-calificacion-a');
if (btnEnviarCalifA) {
    btnEnviarCalifA.addEventListener('click', (e) => {
        e.preventDefault();
        procesarCalificacion('rating');
    });
}

const btnEnviarCalifT = document.getElementById('btn-enviar-calificacion-t');
if (btnEnviarCalifT) {
    btnEnviarCalifT.addEventListener('click', (e) => {
        e.preventDefault();
        procesarCalificacion('rating-t');
    });
}

// 5. Lógica para los botones de OMITIR
  const btnOmitirA = document.getElementById('btn-omitir-calificacion-a');
  const btnOmitirT = document.getElementById('btn-omitir-calificacion-t');

  // Función para volver al dashboard sin guardar nada
  const regresarAlDashboard = (e) => {
      e.preventDefault();
      mostrarSeccionEstudiante('panel-dashboard-estudiante');
  };

  if (btnOmitirA) {
      btnOmitirA.addEventListener('click', regresarAlDashboard);
  }

  if (btnOmitirT) {
      btnOmitirT.addEventListener('click', regresarAlDashboard);
  }

  // --- I. CALENDARIO SEMANAL (Dashboard) ---
  const btnAbrirCalendario = document.getElementById('btn-abrir-calendario');
  const calendarioFlotante = document.getElementById('calendario-flotante');
  const btnCerrarCalendario = document.getElementById('btn-cerrar-calendario');

  if (btnAbrirCalendario && calendarioFlotante) {
      // Toggle abrir/cerrar
      btnAbrirCalendario.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Evita que se cierre inmediatamente si hay listener en document
          calendarioFlotante.classList.toggle('activo');
      });

      // Botón X para cerrar
      if (btnCerrarCalendario) {
          btnCerrarCalendario.addEventListener('click', (e) => {
              e.preventDefault();
              calendarioFlotante.classList.remove('activo');
          });
      }

      // Cerrar si clic fuera
      document.addEventListener('click', (e) => {
          if (!calendarioFlotante.contains(e.target) && !btnAbrirCalendario.contains(e.target)) {
              calendarioFlotante.classList.remove('activo');
          }
      });
      
      // Evitar cierre al hacer clic dentro del calendario
      calendarioFlotante.addEventListener('click', (e) => {
          e.stopPropagation();
      });
  }

  // ==========================================
  // LÓGICA DE CHAT REUTILIZABLE (APRENDIZ Y TUTOR)
  // ==========================================

  /**
   * Función para activar un chat específico
   * @param {string} idPanel - ID de la sección (ej: 'panel-chat-aprendiz')
   * @param {string} idInput - ID del input de texto
   * @param {string} idBtnEnviar - ID del botón de enviar
   * @param {string} idBtnAdjuntar - ID del botón +
   * @param {string} idInputArchivo - ID del input file oculto
   */
  function inicializarChat(idPanel, idInput, idBtnEnviar, idBtnAdjuntar, idInputArchivo) {
      
      const panel = document.getElementById(idPanel);
      if (!panel) return; // Si no existe el panel, no hacemos nada

      const chatAreaMensajes = panel.querySelector('.area-mensajes');
      const inputTexto = document.getElementById(idInput);
      const btnEnviar = document.getElementById(idBtnEnviar);
      const btnAdjuntar = document.getElementById(idBtnAdjuntar);
      const inputArchivo = document.getElementById(idInputArchivo);

      // --- FUNCIONES INTERNAS DEL CHAT ---

      // 1. Agregar mensaje visualmente
      const agregarMensaje = (texto, tipo, esHTML = false) => {
          const nuevaBurbuja = document.createElement('div');
          nuevaBurbuja.classList.add('burbuja-mensaje', tipo);
          if (esHTML) {
              nuevaBurbuja.classList.add('archivo'); // Estilo especial para archivos
              nuevaBurbuja.innerHTML = texto;
          } else {
              nuevaBurbuja.innerHTML = `<span>${texto}</span>`;
          }
          chatAreaMensajes.appendChild(nuevaBurbuja);
          chatAreaMensajes.scrollTop = chatAreaMensajes.scrollHeight;
      };

      // 2. Simular respuesta automática
      const simularRespuesta = () => {
          setTimeout(() => {
              const respuestas = [
                  "Entendido, déjame revisarlo.",
                  "¡Perfecto! Coordinamos la hora.",
                  "¿Podrías enviarme más detalles?",
                  "Recibido, gracias.",
                  "¡Genial! Nos vemos en la sesión."
              ];
              const respuestaAzar = respuestas[Math.floor(Math.random() * respuestas.length)];
              agregarMensaje(respuestaAzar, 'recibido');
          }, 1500);
      };

      // 3. Enviar texto
      const enviarTexto = () => {
          const texto = inputTexto.value.trim();
          if (texto !== "") {
              agregarMensaje(texto, 'enviado');
              inputTexto.value = "";
              simularRespuesta();
          }
      };

      // 4. Procesar Archivo
      const procesarArchivo = (archivo) => {
          const tipo = archivo.type;
          const nombre = archivo.name;
          let html = '';

          if (tipo.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = function(e) {
                  html = `
                      <div class="archivo-info">
                          <span class="archivo-nombre" style="display:block; margin-bottom:5px; font-size:12px;">${nombre}</span>
                          <img src="${e.target.result}" class="preview-imagen-chat" alt="Imagen" style="max-width:100%; border-radius:8px;">
                      </div>`;
                  agregarMensaje(html, 'enviado', true);
              };
              reader.readAsDataURL(archivo);
          } else {
              html = `
                  <span style="font-size: 24px; margin-right:10px;">📄</span>
                  <div class="archivo-info">
                      <span class="archivo-nombre" style="font-weight:bold;">${nombre}</span>
                      <span class="archivo-tipo" style="display:block; font-size:11px;">${(archivo.size / 1024).toFixed(1)} KB</span>
                  </div>`;
              agregarMensaje(html, 'enviado', true);
          }
          // Simular respuesta al archivo
          setTimeout(() => agregarMensaje("Archivo recibido. Lo revisaré pronto.", 'recibido'), 2000);
      };

      // --- EVENT LISTENERS ---

      // Enviar texto
      if (btnEnviar) {
          btnEnviar.addEventListener('click', (e) => {
              e.preventDefault();
              enviarTexto();
          });
      }
      if (inputTexto) {
          inputTexto.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  enviarTexto();
              }
          });
      }

      // Adjuntar archivo
      if (btnAdjuntar && inputArchivo) {
          btnAdjuntar.addEventListener('click', (e) => {
              e.preventDefault();
              inputArchivo.click();
          });

          inputArchivo.addEventListener('change', (e) => {
              const archivo = e.target.files[0];
              if (archivo) procesarArchivo(archivo);
              inputArchivo.value = ''; // Limpiar
          });
      }
  }

  // --- INICIALIZACIÓN DE LOS DOS CHATS ---
  
  // 1. Chat Aprendiz (El original)
  inicializarChat(
      'panel-chat-aprendiz',      // ID Sección
      'chat-input-principal',     // ID Input Texto
      'chat-btn-enviar',          // ID Botón Enviar
      'btn-adjuntar-archivo',     // ID Botón +
      'input-archivo-oculto'      // ID Input File
  );

  // 2. Chat Tutor (El nuevo)
  inicializarChat(
      'panel-chat-tutor',           // ID Sección
      'chat-input-tutor',           // ID Input Texto (NUEVO)
      'chat-btn-enviar-tutor',      // ID Botón Enviar (NUEVO)
      'btn-adjuntar-archivo-tutor', // ID Botón + (NUEVO)
      'input-archivo-oculto-tutor'  // ID Input File (NUEVO)
  );
  // ==========================================
  // LÓGICA: ADJUNTAR ARCHIVOS (SIMULACIÓN)
  // ==========================================

  const btnAdjuntar = document.getElementById('btn-adjuntar-archivo');
  const inputArchivo = document.getElementById('input-archivo-oculto');

  // 1. Al hacer clic en "+", abrimos el selector de archivos del sistema
  if (btnAdjuntar && inputArchivo) {
      btnAdjuntar.addEventListener('click', (e) => {
          e.preventDefault();
          inputArchivo.click(); // Simula clic en el input oculto
      });

      // 2. Detectar cuando el usuario seleccionó un archivo
      inputArchivo.addEventListener('change', (e) => {
          const archivo = e.target.files[0]; // Tomamos el primer archivo
          
          if (archivo) {
              procesarArchivoYEnviar(archivo);
          }
          
          // Limpiar el input para permitir seleccionar el mismo archivo de nuevo si se quiere
          inputArchivo.value = '';
      });
  }

  // 3. Función para "Enviar" el archivo al chat visualmente
  function procesarArchivoYEnviar(archivo) {
      const tipo = archivo.type;
      const nombre = archivo.name;
      let contenidoHTML = '';

      // A. Si es una IMAGEN, mostramos una previsualización
      if (tipo.startsWith('image/')) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
              const urlImagen = e.target.result;
              contenidoHTML = `
                  <div class="archivo-info">
                      <span class="archivo-nombre">${nombre}</span>
                      <img src="${urlImagen}" class="preview-imagen-chat" alt="Imagen enviada">
                  </div>
              `;
              agregarMensajeHTML(contenidoHTML, 'enviado');
          };
          
          reader.readAsDataURL(archivo); // Leemos la imagen para mostrarla
      } 
      // B. Si es PDF u otro archivo, mostramos un icono
      else {
          contenidoHTML = `
              <span class="icono-archivo-chat">📄</span>
              <div class="archivo-info">
                  <span class="archivo-nombre">${nombre}</span>
                  <span class="archivo-tipo">${tipo.split('/')[1] || 'ARCHIVO'} • ${(archivo.size / 1024).toFixed(1)} KB</span>
              </div>
          `;
          agregarMensajeHTML(contenidoHTML, 'enviado');
      }
  }

  // Función auxiliar para agregar HTML complejo (burbujas de archivo)
  function agregarMensajeHTML(html, tipo) {
      const chatArea = document.querySelector('#panel-chat-aprendiz .area-mensajes');
      if (!chatArea) return;

      const nuevaBurbuja = document.createElement('div');
      nuevaBurbuja.classList.add('burbuja-mensaje', tipo, 'archivo'); // Clase especial 'archivo'
      nuevaBurbuja.innerHTML = html;
      
      chatArea.appendChild(nuevaBurbuja);
      chatArea.scrollTop = chatArea.scrollHeight; // Bajar scroll
      
      // Opcional: Simular que el tutor lo "vio" o responde
      // setTimeout(() => agregarMensaje("¡Gracias por el archivo! Lo revisaré.", 'recibido'), 2000);
  }

  // ==========================================
  // LÓGICA: ADJUNTAR ARCHIVOS EN VIDEOLLAMADA
  // ==========================================

  const btnAdjuntarVideo = document.getElementById('btn-adjuntar-video');
  const inputArchivoVideo = document.getElementById('input-archivo-video');
  const chatAreaVideo = document.querySelector('.cuerpo-chat-llamada');

  if (btnAdjuntarVideo && inputArchivoVideo) {
      
      // 1. Clic en el botón abre el selector
      btnAdjuntarVideo.addEventListener('click', (e) => {
          e.preventDefault();
          inputArchivoVideo.click();
      });

      // 2. Al seleccionar archivo
      inputArchivoVideo.addEventListener('change', (e) => {
          const archivo = e.target.files[0];
          if (archivo) {
              enviarArchivoEnVideo(archivo);
          }
          inputArchivoVideo.value = ''; // Limpiar
      });
  }

  function enviarArchivoEnVideo(archivo) {
      const tipo = archivo.type;
      const nombre = archivo.name;
      let contenidoHTML = '';

      // Crear lector de archivos
      const reader = new FileReader();

      reader.onload = function(e) {
          // Si es imagen
          if (tipo.startsWith('image/')) {
              contenidoHTML = `
                  <div class="archivo-info">
                      <strong>Tú:</strong> <br>
                      <img src="${e.target.result}" class="preview-imagen-chat" alt="Imagen enviada">
                  </div>
              `;
          } 
          // Si es otro archivo (PDF, etc)
          else {
              contenidoHTML = `
                  <div class="archivo-info" style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 24px;">📄</span>
                      <div>
                          <strong>Tú:</strong> <br>
                          <span class="archivo-nombre">${nombre}</span> <br>
                          <span class="archivo-tipo" style="font-size: 10px;">${(archivo.size / 1024).toFixed(1)} KB</span>
                      </div>
                  </div>
              `;
          }

          // Crear la burbuja en el chat lateral
          const nuevaBurbuja = document.createElement('div');
          nuevaBurbuja.classList.add('mensaje-chat-llamada', 'propio'); // Usamos estilos del chat de video
          nuevaBurbuja.innerHTML = contenidoHTML;

          if (chatAreaVideo) {
              chatAreaVideo.appendChild(nuevaBurbuja);
              chatAreaVideo.scrollTop = chatAreaVideo.scrollHeight; // Scroll al final
          }
      };

      reader.readAsDataURL(archivo);
  }

   // ==========================================
  // LÓGICA DE CERRAR SESIÓN
  // ==========================================
  
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

  if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener('click', (e) => {
          e.preventDefault(); // Evita el salto inmediato
          
          // Preguntar al usuario (Buena práctica)
          const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
          
          if (confirmar) {
              // Redirigir al Login (está en la misma carpeta 'sitios')
              window.location.href = "./index-login.html";
          }
      });
  }

// ==============================================================
  // GESTIÓN DE HABILIDADES (TAGS)
  // ==============================================================

  // 1. Estado inicial (simulando base de datos o LocalStorage)
  let misHabilidades = JSON.parse(localStorage.getItem('userHabilidades')) || ["Paciente", "Amable", "Activo"];

  // Referencias al DOM
  const listaPerfil = document.getElementById('lista-habilidades-perfil'); // Lista en el perfil principal
  const contenedorEdicion = document.getElementById('contenedor-habilidades-edicion'); // Contenedor en la pantalla de añadir
  const selectHabilidades = document.getElementById('habilidades-select');
  const btnConfirmarAdd = document.getElementById('btn-guardar-habilidad'); // Ojo con el ID, asegúrate que coincida con tu HTML
  const btnVolverHabilidades = document.getElementById('btn-volver-de-habilidades');

  // 2. Función para renderizar (dibujar) las habilidades en ambas pantallas
  function renderizarHabilidades() {
      
      // --- A. Renderizar en el PERFIL (la vista principal) ---
      if (listaPerfil) {
          // Limpiamos la lista pero guardamos el botón de "+"
          const btnAgregar = listaPerfil.querySelector('.agregar');
          listaPerfil.innerHTML = ''; 
          
          misHabilidades.forEach((habilidad) => {
              const li = document.createElement('li');
              li.textContent = habilidad;
              listaPerfil.appendChild(li);
          });

          // Volvemos a poner el botón de agregar al final
          if (btnAgregar) listaPerfil.appendChild(btnAgregar);
          
          // Re-asignar el evento click al botón + porque al limpiar innerHTML se pierde
          const nuevoBtnAdd = listaPerfil.querySelector('.agregar');
          if(nuevoBtnAdd) {
              nuevoBtnAdd.addEventListener('click', () => mostrarSeccionEstudiante('panel-add-habilidades'));
          }
      }

      // --- B. Renderizar en el PANEL DE AGREGAR (para ver y eliminar) ---
      if (contenedorEdicion) {
          contenedorEdicion.innerHTML = ''; // Limpiamos para volver a pintar
          
          misHabilidades.forEach((habilidad, index) => {
              const span = document.createElement('span');
              span.className = 'habilidad-tag'; // Tu clase de estilo
              span.style.marginRight = '10px';
              span.style.marginBottom = '10px';
              span.style.display = 'inline-flex'; // Mejor alineación
              span.style.alignItems = 'center';
              
              // Insertamos el texto y la X roja
              span.innerHTML = `${habilidad} <b class="btn-eliminar-tag" data-index="${index}" style="cursor:pointer; margin-left:8px; color: #ffcccc; font-weight:bold;">✕</b>`;
              
              contenedorEdicion.appendChild(span);
          });

          // Agregar listeners a las X rojas (para eliminar)
          document.querySelectorAll('.btn-eliminar-tag').forEach(btn => {
              btn.addEventListener('click', (e) => {
                  const index = e.target.dataset.index;
                  eliminarHabilidad(index);
              });
          });
      }
  }

  // 3. Función para agregar habilidades desde el Select
  function agregarHabilidadesSeleccionadas() {
      if(!selectHabilidades) return;

      const opcionesSeleccionadas = Array.from(selectHabilidades.selectedOptions).map(option => option.value);
      
      if (opcionesSeleccionadas.length === 0) {
          alert("Por favor selecciona al menos una habilidad de la lista.");
          return;
      }

      let agregadasCount = 0;
      opcionesSeleccionadas.forEach(hab => {
          // Evitar duplicados
          if (!misHabilidades.includes(hab)) {
              misHabilidades.push(hab);
              agregadasCount++;
          }
      });

      if (agregadasCount > 0) {
          guardarYActualizar();
          // alert(`Se agregaron ${agregadasCount} habilidades.`); // Opcional
          selectHabilidades.value = ""; // Limpiar selección visual
      } else {
          alert("Esas habilidades ya las tienes agregadas.");
      }
  }

  // 4. Función para eliminar habilidad
  function eliminarHabilidad(index) {
      misHabilidades.splice(index, 1); // Elimina el elemento del array
      guardarYActualizar(); // Guarda y vuelve a pintar
  }

  // 5. Guardar en LocalStorage y refrescar vista
  function guardarYActualizar() {
      localStorage.setItem('userHabilidades', JSON.stringify(misHabilidades));
      renderizarHabilidades();
  }

  // 6. Listeners de Botones
  if (btnConfirmarAdd) {
      btnConfirmarAdd.addEventListener('click', (e) => {
          e.preventDefault();
          agregarHabilidadesSeleccionadas();
      });
  }

  if (btnVolverHabilidades) {
      btnVolverHabilidades.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarSeccionEstudiante('panel-perfil');
      });
  }

  // Inicializar al cargar
  renderizarHabilidades();

  // ==========================================
  // INTERACCIONES DEL DASHBOARD (ESTUDIANTE)
  // ==========================================

  // 1. Botones "Ver detalles" en las tarjetas de sesión
  // Seleccionamos todos los botones que tengan esa clase
  const botonesDetalleSesion = document.querySelectorAll('.dash-est-boton-detalle');

  botonesDetalleSesion.forEach(boton => {
      boton.addEventListener('click', (e) => {
          e.preventDefault();
          // Redirigir a la sección de Sesiones
          mostrarSeccionEstudiante('panel-sesiones');
          
          // Opcional: Simular que buscamos esa sesión específica
          console.log("Navegando al detalle de la sesión...");
      });
  });

  // 2. Enlace "Ver todas" (Solicitudes) -> Abre la campanita
  const btnVerTodasSolicitudes = document.getElementById('btn-ver-todas-solicitudes');
  
  if (btnVerTodasSolicitudes) {
      btnVerTodasSolicitudes.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Evitar conflictos de cierre
          
          // Simular clic en la campana de notificaciones para abrirla
          const campana = document.getElementById('nav-notificaciones');
          const dropdown = document.getElementById('dropdown-notificaciones');
          
          if (dropdown && campana) {
              dropdown.classList.add('activo');
              // Hacemos scroll suave hacia arriba para que se vea
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }
      });
  }

  // 3. Botón "Ver todos mis tutores" -> Ir a Buscar Tutores
  const btnVerTodosTutores = document.getElementById('btn-ver-todos-tutores');
  
  if (btnVerTodosTutores) {
      btnVerTodosTutores.addEventListener('click', (e) => {
          e.preventDefault();
          // Redirigir a la sección de búsqueda/tutores
          mostrarSeccionEstudiante('panel-tutores');
      });
  }

  // ==========================================
  // BUSCADOR Y FILTROS - MIS TUTORES
  // ==========================================

  const inputBusquedaTutores = document.getElementById('input-busqueda-tutores');
  const btnFiltroTutores = document.getElementById('btn-filtro-tutores');
  const menuFiltrosTutores = document.getElementById('menu-filtros-tutores');
  const opcionesFiltroTutores = document.querySelectorAll('#menu-filtros-tutores .opcion-filtro');
  
  // Estado inicial del filtro
  let filtroTutorActual = 'nombre'; // 'nombre' o 'curso'

  // 1. Mostrar/Ocultar Menú
  if (btnFiltroTutores && menuFiltrosTutores) {
      btnFiltroTutores.addEventListener('click', (e) => {
          e.stopPropagation();
          menuFiltrosTutores.classList.toggle('activo');
      });

      document.addEventListener('click', (e) => {
          if (!menuFiltrosTutores.contains(e.target) && !btnFiltroTutores.contains(e.target)) {
              menuFiltrosTutores.classList.remove('activo');
          }
      });
  }

  // 2. Selección de Filtro (Nombre vs Curso)
  if (opcionesFiltroTutores) {
      opcionesFiltroTutores.forEach(opcion => {
          opcion.addEventListener('click', (e) => {
              // Actualizar variable
              filtroTutorActual = e.target.dataset.tipo;
              
              // Actualizar UI del menú
              opcionesFiltroTutores.forEach(op => op.classList.remove('seleccionado'));
              e.target.classList.add('seleccionado');
              
              // Actualizar Placeholder para guiar al usuario
              if (filtroTutorActual === 'nombre') {
                  inputBusquedaTutores.placeholder = "Buscar por nombre (ej: Victor)...";
              } else {
                  inputBusquedaTutores.placeholder = "Buscar por curso (ej: SQL, Figma)...";
              }
              
              menuFiltrosTutores.classList.remove('activo');
              
              // Re-ejecutar la búsqueda si ya había texto escrito
              filtrarTutores(); 
          });
      });
  }

  // 3. Lógica de Filtrado en Tiempo Real
  if (inputBusquedaTutores) {
      inputBusquedaTutores.addEventListener('keyup', filtrarTutores);
  }

  function filtrarTutores() {
      const texto = inputBusquedaTutores.value.toLowerCase().trim();
      const tarjetas = document.querySelectorAll('#panel-tutores .tarjeta-tutor');

      tarjetas.forEach(tarjeta => {
          let coincide = false;

          if (filtroTutorActual === 'nombre') {
              // Buscar en el nombre del tutor
              const nombre = tarjeta.querySelector('.tutor-nombre').textContent.toLowerCase();
              if (nombre.includes(texto)) {
                  coincide = true;
              }
          } else {
              // Buscar en los tags (temas/cursos)
              const tags = Array.from(tarjeta.querySelectorAll('.tag-tutor'))
                                .map(tag => tag.textContent.toLowerCase());
              // Ver si alguno de los tags incluye el texto buscado
              if (tags.some(tag => tag.includes(texto))) {
                  coincide = true;
              }
          }

          // Mostrar u ocultar tarjeta
          if (coincide) {
              tarjeta.style.display = 'flex';
          } else {
              tarjeta.style.display = 'none';
          }
      });
  }

  // ==========================================
  // BÚSQUEDA PRINCIPAL (SIMULACIÓN)
  // ==========================================

  const inputBusquedaMain = document.getElementById('input-busqueda-principal');
  const btnBuscarMain = document.getElementById('btn-buscar-principal');
  const contenidoInicial = document.getElementById('contenido-inicial-busqueda');
  const resultadosWrapper = document.getElementById('resultados-busqueda-wrapper');
  const listaResultados = document.getElementById('lista-resultados-dinamica');
  const terminoDisplay = document.getElementById('termino-buscado-display');
  const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
  const msgNoResultados = document.getElementById('mensaje-no-resultados');

  // Mini "Base de Datos" Simulada
  const datosTutores = [
      {
          nombre: "Victor Alberca",
          carrera: "Ingeniería de Software",
          rating: "4.8",
          tags: ["SQL", "Base de Datos", "Backend"],
          img: "../assets/images/ima-foto-victor.png"
      },
      {
          nombre: "Maria Lopez",
          carrera: "Diseño Gráfico",
          rating: "4.9",
          tags: ["Figma", "UX/UI", "Prototipado"],
          img: "../assets/images/imagen-tutor-1.png"
      },
      {
          nombre: "Juan Perez",
          carrera: "Ingeniería Civil",
          rating: "4.5",
          tags: ["Calculo", "Física", "Matemáticas"],
          img: "../assets/images/imagen-tutor-2.png" // Usamos una imagen genérica si no hay
      },
      {
          nombre: "Ana Garcia",
          carrera: "Ciencias de la Computación",
          rating: "5.0",
          tags: ["Python", "Algoritmos", "IA"],
          img: "../assets/images/ima-chica1.png" 
      }
  ];

  // Función para ejecutar la búsqueda
  function realizarBusquedaPrincipal() {
      const texto = inputBusquedaMain.value.toLowerCase().trim();
      
      if (texto === "") {
          alert("Por favor ingresa un término de búsqueda.");
          return;
      }

      // 1. Ocultar inicio y mostrar resultados
      contenidoInicial.style.display = 'none';
      resultadosWrapper.style.display = 'block';
      terminoDisplay.textContent = inputBusquedaMain.value;
      listaResultados.innerHTML = ''; // Limpiar anteriores
      msgNoResultados.style.display = 'none';

      // 2. Filtrar datos
      const encontrados = datosTutores.filter(tutor => {
          const coincideNombre = tutor.nombre.toLowerCase().includes(texto);
          const coincideTag = tutor.tags.some(tag => tag.toLowerCase().includes(texto));
          return coincideNombre || coincideTag;
      });

// 3. Renderizar resultados
if (encontrados.length > 0) {
    encontrados.forEach(tutor => {
const card = document.createElement('article');
    card.className = 'tarjeta-tutor-dashboard';
    
    // Generamos el HTML (Nota que quitamos el onclick inline para usar addEventListener)
    card.innerHTML = `
        <div class="tutor-info">
            <img src="${tutor.img}" alt="${tutor.nombre}" class="tutor-foto">
            <div class="tutor-datos">
                <h3 class="tutor-nombre">${tutor.nombre}</h3>
                <p class="tutor-carrera">${tutor.carrera}</p>
                <div class="tutor-rating">⭐ ${tutor.rating}</div>
            </div>
        </div>
        <div class="tutor-tags">
            ${tutor.tags.map(tag => `<span class="tag-tutor">${tag}</span>`).join('')}
        </div>
        <div class="tutor-acciones">
            <button class="btn-ver-perfil">Perfil</button>
            <button class="btn-solicitar">Solicitar</button>
        </div>
    `;

    // --- LÓGICA PARA EL BOTÓN SOLICITAR (Escenario 1 y 2) ---
    const btnSolicitar = card.querySelector('.btn-solicitar');
    btnSolicitar.addEventListener('click', () => {
        // Actualizar nombre en el modal
        if(spanNombreTutor) spanNombreTutor.textContent = tutor.nombre;
        // Abrir modal
        if(modalSolicitud) modalSolicitud.classList.add('activo');
    });

    // --- LÓGICA PARA EL BOTÓN PERFIL (Escenario 3) ---
    const btnPerfil = card.querySelector('.btn-ver-perfil');
    btnPerfil.addEventListener('click', () => {
        // 1. Navegar a la sección de perfil del tutor
        mostrarSeccionEstudiante('panel-perfil-tutor');
        
        // 2. Buscar el botón "Solicitar Tutoria" en esa sección específica
        const btnSolicitarEnPerfil = document.getElementById('btn-solicitar-tutoria');
        
        if (btnSolicitarEnPerfil) {
            // 3. Deshabilitarlo visual y funcionalmente
            btnSolicitarEnPerfil.disabled = true;
            btnSolicitarEnPerfil.textContent = "No disponible (Vista previa)";
            btnSolicitarEnPerfil.style.backgroundColor = "#ccc";
            btnSolicitarEnPerfil.style.cursor = "not-allowed";
            
            // Opcional: Rehabilitarlo si sales de la sección para no afectar otros flujos
            // (Esto es un extra simple para limpiar el estado si navegas luego)
            setTimeout(() => {
               // Solo para demostración: si quieres que se reactive al recargar o cambiar lógica
               // normalmente aquí manejarías un estado global, pero para la HU basta con desactivarlo.
            }, 5000); 
        }
        
        // (Opcional) Actualizar los datos del perfil grande con los del tutor clickeado
        // Esto hace que se vea real:
        const nombreGrande = document.querySelector('.perfil-nombre-grande');
        const fotoGrande = document.querySelector('.perfil-imagen-grande');
        if(nombreGrande) nombreGrande.textContent = tutor.nombre;
        if(fotoGrande) fotoGrande.src = tutor.img;
    });
        listaResultados.appendChild(card);
    });
}
  }

  // Event Listeners
  if (btnBuscarMain) {
      btnBuscarMain.addEventListener('click', (e) => {
          e.preventDefault();
          realizarBusquedaPrincipal();
      });
  }

  if (inputBusquedaMain) {
      inputBusquedaMain.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              realizarBusquedaPrincipal();
          }
      });
  }

  if (btnLimpiarBusqueda) {
      btnLimpiarBusqueda.addEventListener('click', (e) => {
          e.preventDefault();
          // Volver al estado inicial
          resultadosWrapper.style.display = 'none';
          contenidoInicial.style.display = 'block';
          inputBusquedaMain.value = '';
      });
  }
  
  // ==========================================
  // SIMULACIÓN VIDEOLLAMADA (Mic, Cam, Pizarra)
  // ==========================================

  // 1. Botones de Control (Micrófono y Cámara)
  const btnMicro = document.getElementById('btn-micro-video');
  const btnCamara = document.getElementById('btn-camara-video');
  
  // Función para alternar estado
  function alternarEstadoDispositivo(boton, tipo) {
      boton.classList.toggle('desactivado');
      const estaDesactivado = boton.classList.contains('desactivado');
      
      // Feedback visual opcional (tooltip o console)
      if (estaDesactivado) {
          console.log(`${tipo} desactivado`);
          // Aquí podrías mostrar un pequeño aviso visual en la pantalla
      } else {
          console.log(`${tipo} activado`);
      }
  }

  if (btnMicro) {
      btnMicro.addEventListener('click', (e) => {
          e.preventDefault();
          alternarEstadoDispositivo(btnMicro, "Micrófono");
      });
  }

  if (btnCamara) {
      btnCamara.addEventListener('click', (e) => {
          e.preventDefault();
          alternarEstadoDispositivo(btnCamara, "Cámara");
          
          // Opcional: Apagar tu video simulado
          const miVideo = document.querySelector('.video-propio img'); // o video
          if (miVideo) miVideo.style.opacity = btnCamara.classList.contains('desactivado') ? "0.3" : "1";
      });
  }

  // 2. Lógica de la PIZARRA (Canvas)
  const canvas = document.getElementById('mi-canvas-dibujo');
  const btnLimpiar = document.getElementById('btn-limpiar-pizarra');
  const btnCerrarPizarraInt = document.getElementById('btn-cerrar-pizarra-interno');
  const pizarraDiv = document.getElementById('pizarra-overlay');
  
  // Variable para dibujar
  let dibujando = false;
  let ctx = null;

  if (canvas) {
      ctx = canvas.getContext('2d');
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000'; // Color negro por defecto

      // Eventos del Mouse para dibujar
      canvas.addEventListener('mousedown', (e) => {
          dibujando = true;
          ctx.beginPath();
          ctx.moveTo(e.offsetX, e.offsetY);
      });

      canvas.addEventListener('mousemove', (e) => {
          if (!dibujando) return;
          ctx.lineTo(e.offsetX, e.offsetY);
          ctx.stroke();
      });

      canvas.addEventListener('mouseup', () => dibujando = false);
      canvas.addEventListener('mouseout', () => dibujando = false);
  }

  // Botón Limpiar
  if (btnLimpiar && ctx) {
      btnLimpiar.addEventListener('click', () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
  }

  // Botón Cerrar interno
  if (btnCerrarPizarraInt && pizarraDiv) {
      btnCerrarPizarraInt.addEventListener('click', () => {
          pizarraDiv.classList.remove('activa');
          // Actualizar el botón principal si tiene clase activo
          const btnToggle = document.getElementById('btn-toggle-pizarra');
          if (btnToggle) btnToggle.classList.remove('activo');
      });
  }

// ==============================================================
  // INTERACCIONES SECCIÓN SESIONES (SOLICITADAS)
  // ==============================================================

  const panelSesiones = document.getElementById('panel-sesiones');

  if (panelSesiones) {

      // --- Interacción 1: Botón "Aprender un nuevo tema" ---
      // Redirige a la sección de búsqueda principal
      const btnAprenderTema = panelSesiones.querySelector('.boton-aprender-tema');
      if (btnAprenderTema) {
          btnAprenderTema.addEventListener('click', (e) => {
              e.preventDefault();
              mostrarSeccionEstudiante('panel-buscar'); // ID de la sección de búsqueda
          });
      }

      // --- Interacción 2: Botón "Ver detalles" (Solo la primera tarjeta) ---
      // Despliega un menú con información adicional
      const primeraTarjeta = panelSesiones.querySelector('.grid-sesiones .tarjeta-sesion:first-child');
      
      if (primeraTarjeta) {
          const btnDetalle = primeraTarjeta.querySelector('.boton-ver-detalles');
          
          // Crear el div de detalles dinámicamente (para no ensuciar tu HTML)
          const divDetalles = document.createElement('div');
          divDetalles.className = 'detalles-extra';
          divDetalles.innerHTML = `
              <strong>Información de la sesión:</strong>
              <ul>
                  <li>📍 Link: Zoom (Pendiente)</li>
                  <li>📚 Material: Guía de Ejercicios.pdf</li>
                  <li>⭐ Nivel: Intermedio</li>
              </ul>
              <button style="font-size:11px; padding:3px 8px; cursor:pointer;">Contactar Tutor</button>
          `;
          
          // Insertar el div justo después del cuerpo de la tarjeta, antes del botón
          const cuerpoTarjeta = primeraTarjeta.querySelector('.tarjeta-sesion-body');
          cuerpoTarjeta.parentNode.insertBefore(divDetalles, btnDetalle);

          btnDetalle.addEventListener('click', (e) => {
              e.preventDefault();
              // Alternar visibilidad
              divDetalles.classList.toggle('activo');
              
              // Cambiar texto del botón
              if (divDetalles.classList.contains('activo')) {
                  btnDetalle.textContent = "Ocultar detalles";
                  btnDetalle.style.backgroundColor = "#555"; // Cambio visual opcional
              } else {
                  btnDetalle.textContent = "Ver detalles";
                  btnDetalle.style.backgroundColor = ""; // Volver al color original
              }
          });
      }

     // --- Interacción 3 UNIFICADA: Historial + Calificación (HU: Calificar sesión) ---
      
      // A. Función reutilizable para activar la lógica de calificación en un botón
      const configurarBotonCalificacion = (btn) => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              
              const tarjeta = btn.closest('.tarjeta-sesion');
              let formCalificacion = tarjeta.querySelector('.form-calificacion-inline');
              
              if (formCalificacion) {
                  // Toggle visibilidad
                  if (formCalificacion.style.display === 'none') {
                      formCalificacion.style.display = 'block';
                      btn.textContent = "Ocultar calificación";
                  } else {
                      formCalificacion.style.display = 'none';
                      btn.textContent = "Calificar / Ver detalles";
                  }
              } else {
                  // Inyectar formulario por primera vez
                  formCalificacion = document.createElement('div');
                  formCalificacion.className = 'form-calificacion-inline';
                  formCalificacion.style.marginTop = '15px';
                  formCalificacion.style.borderTop = '1px solid #eee';
                  formCalificacion.style.paddingTop = '10px';
                  formCalificacion.style.animation = 'fadeIn 0.3s ease';
                  
                  formCalificacion.innerHTML = `
                      <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #005a9c;">
                          Calificar sesión completada:
                      </p>
                      <div class="estrellas-inline" style="display: flex; gap: 5px; margin-bottom: 10px; cursor: pointer; font-size: 24px;">
                          <span data-value="1">★</span><span data-value="2">★</span><span data-value="3">★</span><span data-value="4">★</span><span data-value="5">★</span>
                      </div>
                      <textarea class="comentario-inline" placeholder="Deja un comentario..." style="width: 100%; height: 60px; padding: 8px; border-radius: 6px; border: 1px solid #ccc; font-family: inherit; margin-bottom: 10px; resize: none; box-sizing: border-box;"></textarea>
                      <button class="btn-enviar-calif-inline" style="background-color: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 13px; width: 100%;">Enviar Calificación</button>
                  `;

                  tarjeta.insertBefore(formCalificacion, btn);
                  btn.textContent = "Cancelar calificación";

                  // Lógica interna: Estrellas y Enviar
                  const estrellas = formCalificacion.querySelectorAll('.estrellas-inline span');
                  let calificacionValor = 0;
                  
                  estrellas.forEach(estrella => {
                      estrella.style.color = "#ccc";
                      estrella.addEventListener('click', (ev) => {
                          calificacionValor = parseInt(ev.target.dataset.value);
                          estrellas.forEach(s => {
                              s.style.color = (parseInt(s.dataset.value) <= calificacionValor) ? "#ffc107" : "#ccc";
                          });
                      });
                  });

                  formCalificacion.querySelector('.btn-enviar-calif-inline').addEventListener('click', () => {
                      if (calificacionValor === 0) { alert("Por favor selecciona una calificación."); return; }
                      const comentario = formCalificacion.querySelector('.comentario-inline').value;
                      
                      console.log(`Enviado: ${calificacionValor} estrellas. "${comentario}"`);
                      alert(`¡Gracias! Has calificado la sesión con ${calificacionValor} estrellas.`);
                      
                      formCalificacion.innerHTML = `<p style="color: #28a745; font-weight: bold; text-align: center; margin-top: 10px;">¡Sesión calificada exitosamente! ✅</p>`;
                      btn.style.display = 'none'; // Ocultar botón para no recalificar
                  });
              }
          });
      };

      // B. Aplicar lógica a las tarjetas EXISTENTES al cargar
      const botonesExistentes = panelSesiones.querySelectorAll('.columna-historial-sesiones .tarjeta-sesion .boton-ver-detalles');
      botonesExistentes.forEach(btn => configurarBotonCalificacion(btn));

      // C. Lógica del botón "Ver todas" (Crea tarjeta NUEVA y le aplica la lógica)
      const btnVerTodasHistorial = panelSesiones.querySelector('.columna-historial-sesiones .boton-ver-todas');
      const contenedorHistorial = panelSesiones.querySelector('.columna-historial-sesiones');

      if (btnVerTodasHistorial) {
          btnVerTodasHistorial.addEventListener('click', (e) => {
              e.preventDefault();
              
              // Si ya está expandido, colapsar
              if (btnVerTodasHistorial.textContent === "Ocultar") {
                  const extra = document.getElementById('tarjeta-extra-historial');
                  if(extra) extra.remove();
                  btnVerTodasHistorial.textContent = "Ver todas";
                  return;
              }

              // Crear nueva tarjeta
              const nuevaTarjeta = document.createElement('div');
              nuevaTarjeta.className = 'tarjeta-sesion';
              nuevaTarjeta.id = 'tarjeta-extra-historial';
              nuevaTarjeta.style.animation = "fadeIn 0.5s ease";
              
              // Nota: Ya no ponemos onclick="alert..." en el HTML, lo asignaremos con JS
              nuevaTarjeta.innerHTML = `
                  <div class="tarjeta-sesion-header">
                      <h3>Física I</h3>
                      <span class="tag-sesion realizado">Realizado</span>
                  </div>
                  <div class="tarjeta-sesion-body">
                      <p><strong>Tutor:</strong> Luis García</p>
                      <p><strong>Estudiante:</strong> Alexandra Meza (Tu)</p>
                      <p><strong>Fecha:</strong> 25/10/2025</p>
                      <p><strong>Hora:</strong> 10:00 am</p>
                  </div>
                  <button class="boton-ver-detalles">Ver detalles</button>
              `;

              contenedorHistorial.insertBefore(nuevaTarjeta, btnVerTodasHistorial);
              
              // IMPORTANTE: Asignar la funcionalidad al botón de la NUEVA tarjeta
              const nuevoBoton = nuevaTarjeta.querySelector('.boton-ver-detalles');
              configurarBotonCalificacion(nuevoBoton);
              
              btnVerTodasHistorial.textContent = "Ocultar";
          });
      }
  }

  // ==========================================
  // LÓGICA DE REPORTAR USUARIO 
  // ==========================================

  const btnAbrirReporteT = document.getElementById('btn-abrir-reporte-t');
  const modalReporte = document.getElementById('modal-reporte-usuario');
  const btnCerrarModalReporte = document.getElementById('btn-cerrar-modal-reporte');
  const btnCancelarReporte = document.getElementById('btn-cancelar-reporte');
  const formReporte = document.getElementById('form-reporte');

  // 1. Abrir el modal de reporte
  if (btnAbrirReporteT && modalReporte) {
      btnAbrirReporteT.addEventListener('click', (e) => {
          e.preventDefault();
          modalReporte.classList.add('activo'); // Usa la clase css existente para mostrar modales
      });
  }

  // 2. Cerrar el modal (X o Cancelar)
  const cerrarModalReporte = () => {
      if (modalReporte) modalReporte.classList.remove('activo');
      if (formReporte) formReporte.reset(); // Limpiar formulario
  };

  if (btnCerrarModalReporte) btnCerrarModalReporte.addEventListener('click', cerrarModalReporte);
  if (btnCancelarReporte) btnCancelarReporte.addEventListener('click', cerrarModalReporte);

  // 3. Enviar el reporte
  if (formReporte) {
      formReporte.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const motivo = document.getElementById('motivo-reporte').value;
          const descripcion = document.getElementById('descripcion-reporte').value;

          if (!motivo) {
              alert("Por favor selecciona un motivo para el reporte.");
              return;
          }

          // Simulación de envío
          console.log("Enviando reporte:", { motivo, descripcion });

          // Cerrar modal actual
          cerrarModalReporte();

          // Mostrar confirmación y redirigir
          alert("✅ Reporte enviado correctamente.\nEl caso será revisado por un administrador.");
          mostrarSeccionEstudiante('panel-dashboard-estudiante');
      });
  }

  // ==========================================
  // LÓGICA: CAMBIO DE ESTADO (US - No Disponible)
  // ==========================================

  const indicadorEstado = document.getElementById('indicador-estado-usuario');
  const btnGroupEstado = document.getElementById('btn-group-estado');

  if (btnGroupEstado && indicadorEstado) {
      const botonesEstado = btnGroupEstado.querySelectorAll('.boton-toggle');

      botonesEstado.forEach(boton => {
          boton.addEventListener('click', (e) => {
              const estadoSeleccionado = e.target.textContent.trim();

              if (estadoSeleccionado === 'Activo') {
                  // Escenario 2: Volver a estar disponible
                  indicadorEstado.classList.remove('ocupado'); // Vuelve a verde
                  indicadorEstado.title = "Estado: Disponible";
                  alert("✅ Ahora estás visible en las búsquedas.");
              } 
              else if (estadoSeleccionado === 'Ocupado') {
                  // Escenario 1: Activar modo "No disponible"
                  indicadorEstado.classList.add('ocupado'); // Cambia a rojo
                  indicadorEstado.title = "Estado: No disponible (Exámenes/Carga alta)";
                  alert("⛔ Modo 'No disponible' activado.\nTu perfil se ocultará temporalmente de las búsquedas.");
              }
          });
      });
  }

  // ==========================================
  // LÓGICA: MINI TARJETA DE PERFIL (US - Revisión Rápida)
  // ==========================================

  const miniPerfilOverlay = document.getElementById('mini-perfil-overlay');
  const btnCerrarMini = document.getElementById('btn-cerrar-mini-perfil');
  const triggersMiniPerfil = document.querySelectorAll('.trigger-mini-perfil');

  // Elementos dentro de la tarjeta para rellenar
  const miniImg = document.getElementById('mini-img');
  const miniNombre = document.getElementById('mini-nombre');
  const miniUni = document.getElementById('mini-uni');
  const miniCurso = document.getElementById('mini-curso');

  // 1. Función abrir tarjeta con datos dinámicos
  triggersMiniPerfil.forEach(img => {
      img.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Evitar que cierre el dropdown de notificaciones
          
          // Obtener datos del atributo data-
          const data = e.target.dataset;
          
          // Llenar la tarjeta
          if(miniImg) miniImg.src = data.foto;
          if(miniNombre) miniNombre.textContent = data.nombre;
          if(miniUni) miniUni.textContent = data.uni;
          if(miniCurso) miniCurso.textContent = data.curso;

          // Mostrar overlay
          if(miniPerfilOverlay) miniPerfilOverlay.classList.add('activo');
      });
  });

  // 2. Cerrar tarjeta
  if (btnCerrarMini) {
      btnCerrarMini.addEventListener('click', () => {
          miniPerfilOverlay.classList.remove('activo');
      });
  }

  // Cerrar al hacer clic fuera de la tarjeta
  if (miniPerfilOverlay) {
      miniPerfilOverlay.addEventListener('click', (e) => {
          if (e.target === miniPerfilOverlay) {
              miniPerfilOverlay.classList.remove('activo');
          }
      });
  }

  const btnEnviarRapido = document.getElementById('btn-enviar-rapido-mini');
  const inputMensajeRapido = document.getElementById('input-mensaje-rapido-mini');

  if (btnEnviarRapido && inputMensajeRapido) {
      btnEnviarRapido.addEventListener('click', (e) => {
          e.preventDefault();
          
          const mensaje = inputMensajeRapido.value.trim();
          const nombreDestino = document.getElementById('mini-nombre').textContent;

          if (mensaje === "") {
              alert("Por favor escribe un mensaje.");
              return;
          }

          // Simulación de envío
          console.log(`Mensaje rápido enviado a ${nombreDestino}: ${mensaje}`);
          
          // Feedback visual
          alert(`✅ Mensaje enviado a ${nombreDestino}:\n"${mensaje}"`);
          
          // Limpiar el input
          inputMensajeRapido.value = "";
          
          // Opcional: Cerrar la tarjeta si se desea, o dejarla abierta para Aceptar/Rechazar
          // miniPerfilOverlay.classList.remove('activo'); 
      });
  }

  // ==========================================
  // LÓGICA: GESTIÓN DE NOTIFICACIONES (Aceptar/Rechazar)
  // ==========================================
  
  const listaNotif = document.getElementById('dropdown-notificaciones');
  const badgeNotif = document.querySelector('.badge-notificaciones');

  if (listaNotif) {
      listaNotif.addEventListener('click', (e) => {
          // Detectamos si el clic fue en un botón (o en el ícono dentro del botón)
          const btnRechazar = e.target.closest('.dash-est-accion-btn.rechazar');
          const btnAceptar  = e.target.closest('.dash-est-accion-btn.aceptar');
          const item = e.target.closest('.notificacion-item');

          // --- CASO 1: RECHAZAR (Escenario 2 de la HU) ---
          if (btnRechazar && item) {
              e.preventDefault();
              e.stopPropagation(); // Evitamos que se cierre el menú inmediatamente

              // 1. Confirmación de seguridad
              const confirmar = confirm("¿Estás seguro de que deseas rechazar esta solicitud?");

              if (confirmar) {
                  // 2. Simulación de envío de notificación (Feedback)
                  alert("✅ La solicitud se ha cerrado y se ha enviado una notificación al estudiante.");

                  // 3. Eliminar visualmente el elemento
                  item.style.transition = "all 0.3s ease";
                  item.style.opacity = "0";
                  item.style.transform = "translateX(20px)";
                  
                  setTimeout(() => {
                      item.remove();
                      actualizarContadorNotificaciones(); // Actualizamos el numerito rojo
                  }, 300);
              }
          }

          // --- CASO 2: ACEPTAR (Opcional, por si lo necesitas) ---
          if (btnAceptar && item) {
              e.preventDefault();
              e.stopPropagation();
              alert("¡Genial! Has aceptado la solicitud. Se abrirá un chat con el estudiante.");
              item.remove();
              actualizarContadorNotificaciones();
          }
      });
  }

  // Función auxiliar para bajar el número de la campanita
  function actualizarContadorNotificaciones() {
      if (badgeNotif) {
          let cantidad = document.querySelectorAll('.notificacion-item').length;
          badgeNotif.textContent = cantidad;
          
          // Si no quedan notificaciones, ocultamos el badge rojo
          if (cantidad === 0) {
              badgeNotif.style.display = 'none';
              // Opcional: Mostrar mensaje de "No hay notificaciones"
              const lista = document.querySelector('.lista-notificaciones');
              if(lista) lista.innerHTML = '<li style="padding:15px; text-align:center; color:#666;">No tienes notificaciones nuevas.</li>';
          }
      }
  }

  // ==========================================
// LÓGICA HU: SOLICITAR TUTORÍA & PERFIL
// ==========================================

// Referencias al DOM del nuevo modal
const modalSolicitud = document.getElementById('modal-solicitud-tutoria');
const formSolicitud = document.getElementById('form-solicitud-tutoria');
const txtMensajeSolicitud = document.getElementById('mensaje-solicitud');
const msgErrorSolicitud = document.getElementById('error-mensaje-solicitud');
const btnCerrarSolicitud = document.getElementById('btn-cerrar-solicitud');
const btnCancelarSolicitud = document.getElementById('btn-cancelar-solicitud');
const spanNombreTutor = document.getElementById('nombre-tutor-solicitud');

// Función para cerrar el modal de solicitud
function cerrarModalSolicitud() {
    if (modalSolicitud) modalSolicitud.classList.remove('activo');
    if (formSolicitud) formSolicitud.reset();
    if (msgErrorSolicitud) msgErrorSolicitud.style.display = 'none'; // Ocultar error al cerrar
}

// Event listeners para cerrar
if (btnCerrarSolicitud) btnCerrarSolicitud.addEventListener('click', cerrarModalSolicitud);
if (btnCancelarSolicitud) btnCancelarSolicitud.addEventListener('click', cerrarModalSolicitud);

// Lógica del Formulario (Escenarios 1 y 2)
if (formSolicitud) {
    formSolicitud.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mensaje = txtMensajeSolicitud.value.trim();

        // --- ESCENARIO 2 (Negativo): Intentar enviar sin mensaje ---
        if (mensaje === "") {
            // Mostrar error
            msgErrorSolicitud.style.display = 'block';
            txtMensajeSolicitud.style.borderColor = '#dc3545'; // Borde rojo opcional
            return; // Detener ejecución
        }

        // --- ESCENARIO 1 (Exitoso): Mensaje enviado ---
        // Si llega aquí, es porque hay mensaje
        msgErrorSolicitud.style.display = 'none';
        txtMensajeSolicitud.style.borderColor = '#ccc';

        // Simulación de éxito
        alert("✅ Tu solicitud ha sido enviada correctamente.");
        cerrarModalSolicitud();
    });
}

// =======================================================
  // LOGICA INDEPENDIENTE PARA EL TUTOR (IDs con -t)
  // =======================================================

  // 1. Lógica de la Pizarra Tutor
  const btnPizarraTutor = document.getElementById('btn-toggle-pizarra-t');
  const pizarraOverlayTutor = document.getElementById('pizarra-overlay-t');
  const btnCerrarPizarraTutor = document.getElementById('btn-cerrar-pizarra-interno-t');

  if (btnPizarraTutor && pizarraOverlayTutor) {
      btnPizarraTutor.addEventListener('click', (e) => {
          e.preventDefault();
          pizarraOverlayTutor.classList.toggle('activa'); // Muestra/oculta
          btnPizarraTutor.classList.toggle('activo'); // Pinta el botón
      });
  }
  
  if (btnCerrarPizarraTutor && pizarraOverlayTutor) {
      btnCerrarPizarraTutor.addEventListener('click', (e) => {
          e.preventDefault();
          pizarraOverlayTutor.classList.remove('activa');
          if(btnPizarraTutor) btnPizarraTutor.classList.remove('activo');
      });
  }

  // 2. Lógica del Chat Tutor
  const btnChatTutor = document.getElementById('btn-toggle-chat-llamada-t');
  const panelChatTutor = document.getElementById('panel-chat-llamada-t');
  const btnCerrarChatTutor = document.getElementById('btn-cerrar-chat-llamada-t');

  if (btnChatTutor && panelChatTutor) {
      btnChatTutor.addEventListener('click', (e) => {
          e.preventDefault();
          panelChatTutor.classList.toggle('activo');
          btnChatTutor.classList.toggle('activo');
      });
  }

  if (btnCerrarChatTutor && panelChatTutor) {
      btnCerrarChatTutor.addEventListener('click', (e) => {
          e.preventDefault();
          panelChatTutor.classList.remove('activo');
          if(btnChatTutor) btnChatTutor.classList.remove('activo');
      });
  }

  // 3. Lógica de Adjuntar Archivo en el Chat Tutor
  const btnAdjuntarTutor = document.getElementById('btn-adjuntar-video-t');
  const inputArchivoTutor = document.getElementById('input-archivo-video-t');
  // Buscamos específicamente el cuerpo del chat del tutor
  const chatAreaTutor = document.querySelector('#panel-chat-llamada-t .cuerpo-chat-llamada');

  if (btnAdjuntarTutor && inputArchivoTutor) {
      btnAdjuntarTutor.addEventListener('click', (e) => {
          e.preventDefault();
          inputArchivoTutor.click();
      });

      inputArchivoTutor.addEventListener('change', (e) => {
          const archivo = e.target.files[0];
          if (archivo) {
              // Lógica simplificada para enviar mensaje en este chat específico
              const lector = new FileReader();
              lector.onload = function(ev) {
                  // Crear la burbuja
                  const nuevaBurbuja = document.createElement('div');
                  nuevaBurbuja.classList.add('mensaje-chat-llamada', 'propio');
                  
                  if (archivo.type.startsWith('image/')) {
                       nuevaBurbuja.innerHTML = `
                          <div class="archivo-info">
                              <strong>Tú (Tutor):</strong> <br>
                              <img src="${ev.target.result}" class="preview-imagen-chat" style="max-width:100%; border-radius:5px; margin-top:5px;">
                          </div>`;
                  } else {
                       nuevaBurbuja.innerHTML = `
                          <div class="archivo-info">
                              <strong>Tú (Tutor):</strong> <br>
                              📄 ${archivo.name}
                          </div>`;
                  }
                  
                  if (chatAreaTutor) {
                      chatAreaTutor.appendChild(nuevaBurbuja);
                      chatAreaTutor.scrollTop = chatAreaTutor.scrollHeight;
                  }
              };
              lector.readAsDataURL(archivo);
          }
          inputArchivoTutor.value = ''; // Limpiar
      });
  }
  
  // --- INICIO POR DEFECTO ---
  // Mostrar Dashboard al cargar
  mostrarSeccionEstudiante('panel-dashboard-estudiante');

});
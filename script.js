// Esperar a que el DOM esté completamente cargado y parseado
document.addEventListener("DOMContentLoaded", () => {
  // --- CACHE DE ELEMENTOS DEL DOM ---
  const sobre = document.getElementById("sobre");
  const pantallaInicial = document.getElementById("pantalla-inicial");
  const contenidoPrincipal = document.getElementById("contenido-principal");
  const bodyElement = document.body;
  const scrollBar = document.getElementById("scrollBar");
  const countdownContainer = document.querySelector(".countdown-circle");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const ibanTextElement = document.getElementById("ibanText");
  const mensajeElement = document.getElementById("copiadoMensaje");
  const scrollIcons = document.querySelectorAll(".scroll-icon"); // Todas las flechas de scroll

  // --- FUNCIÓN: ABRIR INVITACIÓN ---
  function abrirInvitacion() {
    if (pantallaInicial) {
      pantallaInicial.classList.add("hidden"); // Oculta la pantalla inicial
    }
    if (contenidoPrincipal) {
      contenidoPrincipal.classList.add("visible-content"); // Hace visible el contenido principal
    }
    bodyElement.classList.add("content-visible"); // Gestiona el overflow en body via CSS
    window.scrollTo({ top: 0, behavior: "smooth" }); // Asegura scroll al inicio de la página
  }

  // Event Listeners para el sobre
  if (sobre) {
    sobre.addEventListener("click", abrirInvitacion);
    sobre.addEventListener("keydown", (event) => {
      // Accesibilidad: abre con Enter
      if (event.key === "Enter" || event.key === " ") { // Añadir espacio también
        event.preventDefault(); // Previene el scroll por defecto si es espacio
        abrirInvitacion();
      }
    });
  }

  // --- FUNCIÓN: SCROLL SUAVE A LA SIGUIENTE SECCIÓN ---
  // Este es el punto crucial donde podría ocurrir el doble salto.
  // Si tienes 'scroll-snap-type' en tu CSS, es muy probable que esté interfiriendo.
  // La solución más robusta es gestionar el scroll snap con JavaScript o quitarlo.
  function scrollToNextSection(event) {
    event.preventDefault(); // Evita cualquier comportamiento por defecto, aunque sea un <i>

    const currentSection = this.closest("section"); // 'this' se refiere al icono
    const nextSection = currentSection ? currentSection.nextElementSibling : null;

    if (nextSection) {
      // IMPORTANTE: Si tienes scroll-snap-type, considera deshabilitarlo temporalmente
      // o usar scroll-snap-align: start; en las secciones.
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Adjuntar event listeners a todas las flechas de scroll
  scrollIcons.forEach((flecha) => {
    flecha.addEventListener("click", scrollToNextSection);
  });

  // --- REVELAR SECCIONES AL HACER SCROLL (Intersection Observer) ---
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Dejar de observar una vez visible
        }
      });
    },
    {
      threshold: 0.3, // Cuando el 30% de la sección es visible
      rootMargin: "0px 0px -50px 0px", // Carga 50px antes de llegar al final del viewport
    }
  );

  document.querySelectorAll(".seccion.reveal").forEach((sec) => {
    if (sec) observer.observe(sec);
  });

  // --- CUENTA REGRESIVA ---
  const weddingDate = new Date("2026-06-27T12:00:00"); // Fecha y hora de la boda

  function updateCountdown() {
    const now = new Date();
    const diff = weddingDate - now;

    // Salir si el contenedor no existe para evitar errores
    if (!countdownContainer) return;

    if (diff <= 0) {
      // La fecha ha pasado o es el día
      if (countdownContainer.innerHTML !== "<h3>¡Ya es el gran día!</h3>") {
        countdownContainer.innerHTML = "<h3>¡Ya es el gran día!</h3>";
      }
      clearInterval(countdownInterval); // Detener el intervalo
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Actualizar elementos solo si existen
    if (daysEl) daysEl.textContent = days.toString().padStart(2, "0");
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, "0");
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, "0");
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, "0");
  }

  let countdownInterval;
  // Iniciar la cuenta regresiva solo si todos los elementos necesarios existen
  if (daysEl && hoursEl && minutesEl && secondsEl && countdownContainer) {
    updateCountdown(); // Llamada inicial para evitar un retraso de 1 segundo
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  // --- FUNCIÓN: COPIAR IBAN (Expuesta globalmente para onclick en HTML) ---
  window.copiarIBAN = function () {
    if (!ibanTextElement || !mensajeElement) {
      console.error("Elementos para copiar IBAN no encontrados.");
      return;
    }

    const ibanText = ibanTextElement.innerText;

    // Uso de la API moderna de Clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(ibanText)
        .then(() => {
          mensajeElement.style.opacity = '1'; // Usar opacidad para una transición más suave
          mensajeElement.style.visibility = 'visible';
          setTimeout(() => {
            mensajeElement.style.opacity = '0';
            mensajeElement.style.visibility = 'hidden';
          }, 2500);
        })
        .catch((err) => {
          console.error("Error al copiar el IBAN: ", err);
          alert("No se pudo copiar el IBAN. Por favor, cópialo manualmente.");
        });
    } else {
      // Fallback para navegadores antiguos sin la API de Clipboard
      const textArea = document.createElement("textarea");
      textArea.value = ibanText;
      textArea.style.position = "fixed"; // Oculta el textarea
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        mensajeElement.style.opacity = '1';
        mensajeElement.style.visibility = 'visible';
        setTimeout(() => {
          mensajeElement.style.opacity = '0';
          mensajeElement.style.visibility = 'hidden';
        }, 2500);
      } catch (err) {
        console.error("Fallback: Error al copiar el IBAN", err);
        alert("No se pudo copiar el IBAN. Por favor, cópialo manualmente.");
      }
      document.body.removeChild(textArea);
    }
  };

  // --- BARRA DE PROGRESO DEL SCROLL ---
  let scrollAnimationFrameId = null; // Para almacenar el ID de la animación
  function handleScrollProgress() {
    if (scrollAnimationFrameId) {
      window.cancelAnimationFrame(scrollAnimationFrameId);
    }

    scrollAnimationFrameId = window.requestAnimationFrame(() => {
      if (scrollBar) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        // Calcular la altura total scrollable de la página
        const docHeight = document.documentElement.scrollHeight;
        const windowHeight = document.documentElement.clientHeight;
        const scrollableHeight = docHeight - windowHeight;

        // Evitar división por cero si la página no es scrollable
        if (scrollableHeight > 0) {
          const scrollPercent = (scrollTop / scrollableHeight) * 100;
          scrollBar.style.width = scrollPercent + "%";
        } else {
          scrollBar.style.width = "0%"; // Si no hay scroll, la barra está vacía
        }
      }
      scrollAnimationFrameId = null; // Resetear el ID
    });
  }

  // Escuchar el evento scroll en 'window' para abarcar todo el documento
  window.addEventListener("scroll", handleScrollProgress, { passive: true });
  // Llamada inicial para establecer la barra al cargar la página
  handleScrollProgress();
}); // Fin de DOMContentLoaded
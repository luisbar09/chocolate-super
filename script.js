/* ====================================
   CHOCOLATE SUPER - LÓGICA PREMIUM
   ==================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initRevealAnimations();
    initSmoothScroll();
    initContactForm();
    initMobileMenu();
    initImageZoom();
    updateFooterYear();
});

/* ====================================
   GESTIÓN DEL NAVBAR
   ==================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ====================================
   ANIMACIONES DE REVELACIÓN (SCROLL)
   ==================================== */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    // Si no está soportado el IntersectionObserver, mostramos todo inmediatamente
    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => {
            el.classList.add('active');
            const items = el.querySelectorAll('.producto-card, .precio-item, .distribucion-card, .feature-item');
            items.forEach(item => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            });
        });
        return;
    }
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Si el elemento tiene hijos que queremos animar escalonadamente
                const staggerItems = entry.target.querySelectorAll('.producto-card, .precio-item, .distribucion-card, .feature-item');
                if (staggerItems.length > 0) {
                    staggerItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100); // 100ms entre cada item para mayor dinamismo
                    });
                }
                
                // Dejar de observar una vez revelado para evitar ejecuciones repetidas
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.02, // Se activa con el 2% de visibilidad para asegurar que responda en móviles con secciones muy altas
        rootMargin: '0px 0px -20px 0px' // Menos margen inferior para pantallas de menor altura
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Preparar items escalonados para la animación inicial (invisible)
    const itemsToPrep = document.querySelectorAll('.producto-card, .precio-item, .distribucion-card, .feature-item');
    itemsToPrep.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    });
}

/* ====================================
   NAVEGACIÓN SUAVE
   ==================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ====================================
   MENÚ MÓVIL
   ==================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
}

/* ====================================
   FORMULARIO DE CONTACTO
   ==================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Simular envío
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            const formData = new FormData(form);
            const response = await fetch('/contact', {
                method: 'POST',
                body: new URLSearchParams(formData) // Usar URLSearchParams para compatibilidad simple con express
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast(result.message, 'success');
                form.reset();
            } else {
                showToast(result.message || 'Hubo un error al enviar el mensaje.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión el servidor. Intenta de nuevo.', 'error');
            console.error('Error al enviar formulario:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/* ====================================
   NOTIFICACIONES (TOASTS)
   ==================================== */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    // Estilos dinámicos para el brindis (personalizables en CSS)
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: type === 'success' ? '#2b160b' : '#c0392b',
        color: '#fff',
        padding: '1rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        zIndex: '2000',
        transition: 'all 0.5s ease',
        transform: 'translateY(100px)',
        opacity: '0',
        fontFamily: 'Outfit, sans-serif'
    });

    document.body.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 100);

    // Salida
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

/* ====================================
   ÚTILES
   ==================================== */
function updateFooterYear() {
    const yearSpan = document.querySelector('.footer-bottom p');
    if (yearSpan) {
        const year = new Date().getFullYear();
        yearSpan.innerHTML = `&copy; ${year} Chocolate Super. 100% Artesanal Salvadoreño.<br>Hecho con pasión por el chocolate.`;
    }
}

/* ====================================
   ZOOM DE IMÁGENES (LIGHTBOX)
   ==================================== */
function initImageZoom() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imgZoomed');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !modalImg) return;

    // Seleccionar todas las imágenes de productos
    const productImages = document.querySelectorAll('.img-producto');

    productImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
            document.body.classList.add('no-scroll');
        });
    });

    // Cerrar con el botón (X)
    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });

    function closeModal() {
        modal.style.display = "none";
        document.body.classList.remove('no-scroll');
    }
}

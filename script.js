/**
 * Nice Vision - Vanilla JavaScript Functionality
 * Features:
 * - Dynamic copyright year
 * - Mobile navbar auto-close on link click
 * - Active scrollspy link highlighting
 * - Product selection auto-fill for contact form
 * - Contact Form validation & interactive feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Set current year in footer
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 2. Auto-close mobile navbar when a link is clicked
  const navLinks = document.querySelectorAll('.brand-navbar .nav-link, .brand-navbar .btn-call-cta');
  const navbarCollapse = document.getElementById('navbarContent');
  
  if (navbarCollapse) {
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse, { toggle: false });
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          bsCollapse.hide();
        }
      });
    });
  }

  // 3. Highlight Active Navigation Item on Scroll (if internal hash links are present)
  const sections = document.querySelectorAll('section[id]');
  const mainNavLinks = document.querySelectorAll('.brand-navbar .nav-link');

  function updateActiveNavLink() {
    if (!sections.length) return;
    let scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        mainNavLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            link.classList.remove('active');
            if (href === `#${id}`) {
              link.classList.add('active');
            }
          }
        });
      }
    });
  }

  if (document.querySelector('.brand-navbar .nav-link[href^="#"]')) {
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();
  }

  // 4. Responsive Infinite Autoplay Product Carousel
  const carouselWrapper = document.getElementById('productCarouselWrapper');
  const carouselTrack = document.getElementById('productCarouselTrack');

  if (carouselWrapper && carouselTrack) {
    const originalSlides = Array.from(carouselTrack.children);
    const totalOriginal = originalSlides.length;

    if (totalOriginal > 0) {
      // Clone slides before and after to enable seamless infinite looping
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        carouselTrack.appendChild(clone);
      });
      originalSlides.slice().reverse().forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        carouselTrack.insertBefore(clone, carouselTrack.firstChild);
      });

      const allSlides = Array.from(carouselTrack.children);
      let currentIndex = totalOriginal; // Start at first original slide
      let isTransitioning = false;
      let isPaused = false;
      let autoplayTimer = null;
      const autoplayDelay = 3500;
      const transitionDuration = 600;

      function getSlideStride() {
        if (allSlides.length < 2) return carouselTrack.offsetWidth;
        const firstRect = allSlides[0].getBoundingClientRect();
        const secondRect = allSlides[1].getBoundingClientRect();
        return secondRect.left - firstRect.left;
      }

      function updatePosition(animate = true) {
        const stride = getSlideStride();
        if (animate) {
          carouselTrack.style.transition = `transform ${transitionDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
          isTransitioning = true;
        } else {
          carouselTrack.style.transition = 'none';
          isTransitioning = false;
        }
        carouselTrack.style.transform = `translateX(-${currentIndex * stride}px)`;
      }

      function nextSlide() {
        if (isTransitioning) return;
        currentIndex++;
        updatePosition(true);
      }

      function prevSlide() {
        if (isTransitioning) return;
        currentIndex--;
        updatePosition(true);
      }

      carouselTrack.addEventListener('transitionend', () => {
        isTransitioning = false;
        // Infinite wrap jump without transition
        if (currentIndex >= totalOriginal * 2) {
          currentIndex -= totalOriginal;
          updatePosition(false);
        } else if (currentIndex < totalOriginal) {
          currentIndex += totalOriginal;
          updatePosition(false);
        }
      });

      // Autoplay Timer Management
      function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
          if (!isPaused && !isDragging) {
            nextSlide();
          }
        }, autoplayDelay);
      }

      function stopAutoplay() {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      // Desktop: Pause on hover
      carouselWrapper.addEventListener('mouseenter', () => {
        isPaused = true;
      });

      carouselWrapper.addEventListener('mouseleave', () => {
        isPaused = false;
      });

      // Touch / Swipe & Mouse Drag
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let currentTranslateX = 0;
      let dragOffset = 0;
      let isHorizontalSwipe = null;

      function getTrackTranslateX() {
        const style = window.getComputedStyle(carouselTrack);
        const matrix = new DOMMatrixReadOnly(style.transform);
        return matrix.m41;
      }

      function onTouchStart(e) {
        if (isTransitioning) return;
        const touch = e.touches ? e.touches[0] : e;
        isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        dragOffset = 0;
        isHorizontalSwipe = null;
        currentTranslateX = getTrackTranslateX();
        carouselTrack.style.transition = 'none';
        stopAutoplay();
      }

      function onTouchMove(e) {
        if (!isDragging) return;
        const touch = e.touches ? e.touches[0] : e;
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (isHorizontalSwipe === null && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
          isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalSwipe) {
          if (e.cancelable) e.preventDefault();
          dragOffset = deltaX;
          carouselTrack.style.transform = `translateX(${currentTranslateX + dragOffset}px)`;
        }
      }

      function onTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        startAutoplay();

        if (isHorizontalSwipe) {
          const threshold = 40;
          if (dragOffset < -threshold) {
            nextSlide();
          } else if (dragOffset > threshold) {
            prevSlide();
          } else {
            updatePosition(true);
          }
        } else {
          updatePosition(true);
        }
      }

      carouselWrapper.addEventListener('touchstart', onTouchStart, { passive: true });
      carouselWrapper.addEventListener('touchmove', onTouchMove, { passive: false });
      carouselWrapper.addEventListener('touchend', onTouchEnd, { passive: true });
      carouselWrapper.addEventListener('touchcancel', onTouchEnd, { passive: true });

      // Mouse drag support
      carouselWrapper.addEventListener('mousedown', (e) => {
        onTouchStart(e);
        const onMouseMove = (ev) => onTouchMove(ev);
        const onMouseUp = () => {
          onTouchEnd();
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // Prevent default image dragging
      carouselWrapper.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
      });

      // Responsive resize handling
      window.addEventListener('resize', () => {
        updatePosition(false);
      }, { passive: true });

      // Initialize positioning and autoplay
      requestAnimationFrame(() => {
        updatePosition(false);
        startAutoplay();
      });
    }
  }

  // 5. Contact Form Validation & Submission Feedback
  const contactForm = document.getElementById('contactForm');
  const alertPlaceholder = document.getElementById('formAlertPlaceholder');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type = 'success') {
    if (!alertPlaceholder) return;
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} fs-5"></i>
        <div>${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const fullName = document.getElementById('fullName');
      const emailAddress = document.getElementById('emailAddress');
      const messageContent = document.getElementById('messageContent');

      // Basic regex for email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let isValid = true;

      // Validate Full Name
      if (!fullName.value.trim()) {
        fullName.classList.add('is-invalid');
        isValid = false;
      } else {
        fullName.classList.remove('is-invalid');
        fullName.classList.add('is-valid');
      }

      // Validate Email
      if (!emailAddress.value.trim() || !emailPattern.test(emailAddress.value.trim())) {
        emailAddress.classList.add('is-invalid');
        isValid = false;
      } else {
        emailAddress.classList.remove('is-invalid');
        emailAddress.classList.add('is-valid');
      }

      // Validate Message
      if (!messageContent.value.trim()) {
        messageContent.classList.add('is-invalid');
        isValid = false;
      } else {
        messageContent.classList.remove('is-invalid');
        messageContent.classList.add('is-valid');
      }

      if (isValid) {
        // Show loading state on button
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>Sending...</span>
        `;

        // Simulate fast asynchronous submission
        setTimeout(() => {
          showAlert(
            `<strong>Thank you, ${fullName.value.trim()}!</strong> Your message has been received. Our optical team at Nice Vision will contact you shortly.`,
            'success'
          );

          // Reset form fields
          contactForm.reset();
          fullName.classList.remove('is-valid');
          emailAddress.classList.remove('is-valid');
          messageContent.classList.remove('is-valid');

          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        }, 600);
      } else {
        showAlert('Please fill in all required fields correctly before submitting.', 'danger');
      }
    });

    // Remove invalid class on input change
    contactForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          input.classList.remove('is-invalid');
        }
      });
    });
  }
});

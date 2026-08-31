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

  // 4. Product Card Action: Auto-select service in Contact Form and scroll
  const productButtons = document.querySelectorAll('.product-card .btn-card-action');
  const serviceSelect = document.getElementById('serviceInterest');

  productButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard && serviceSelect) {
        const productTitle = productCard.querySelector('.card-title')?.textContent.trim();
        
        // Find matching option or select corresponding
        for (let option of serviceSelect.options) {
          if (option.text.toLowerCase().includes(productTitle.toLowerCase())) {
            serviceSelect.value = option.value;
            break;
          }
        }
      }
    });
  });

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

document.addEventListener('DOMContentLoaded', () => {
  // Initialize pet slider if exists
  const petSlider = document.querySelector('.pet-slider');
  if (petSlider) initPetSlider();

  // Load login modal
  fetch('login-modal.html')
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('login-container');
      if (container) {
        container.innerHTML = html;
        initializeLoginModal();
      }
    })
    .catch(error => console.error('Error loading modal:', error));

  // Menu toggle functionality
  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  });

  // Handle all form submissions
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Form submitted successfully! We will contact you shortly.');
      form.reset();
    });
  });

  // Pre-fill pet information if coming from links
  const params = new URLSearchParams(window.location.search);
  const petName = params.get('pet');
  if (petName) {
    const petInput = document.getElementById('pet');
    if (petInput) petInput.value = petName;
  }
});

// Pet Slider Functionality
function initPetSlider() {
  const slider = document.querySelector('.slider-wrapper');
  const slides = document.querySelectorAll('.pet-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  let slideIndex = 0;
  let isTransitioning = false;

  // Create slider dots
  if (dotsContainer) {
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => !isTransitioning && goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  // Slider navigation
  document.querySelector('.next')?.addEventListener('click', () => !isTransitioning && nextSlide());
  document.querySelector('.prev')?.addEventListener('click', () => !isTransitioning && prevSlide());

  function updateSlider() {
    isTransitioning = true;
    slider.style.transform = `translateX(-${slideIndex * 100}%)`;

    setTimeout(() => {
      isTransitioning = false;
      // Handle infinite loop
      if (slideIndex === slides.length) {
        slideIndex = 0;
        slider.style.transition = 'none';
        slider.style.transform = `translateX(0)`;
        void slider.offsetWidth;
        slider.style.transition = 'transform 0.6s ease-in-out';
      }
      if (slideIndex === -1) {
        slideIndex = slides.length - 1;
        slider.style.transition = 'none';
        slider.style.transform = `translateX(-${slideIndex * 100}%)`;
        void slider.offsetWidth;
        slider.style.transition = 'transform 0.6s ease-in-out';
      }
    }, 300);

    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === slideIndex);
    });
  }

  function nextSlide() {
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 0;
    updateSlider();
  }

  function prevSlide() {
    slideIndex--;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    updateSlider();
  }

  function goToSlide(index) {
    slideIndex = index;
    updateSlider();
  }

  // Auto-advance slider
  if (slides.length > 1) {
    setInterval(() => !isTransitioning && nextSlide(), 5000);
  }
}

// Login Modal Functionality
function initializeLoginModal() {
  const modal = document.getElementById('authModal');
  const loginBtn = document.getElementById('hlogin');
  if (!modal || !loginBtn) return;

  const closeBtn = modal.querySelector('.close');
  const loginTab = modal.querySelector('#loginTab');
  const signupTab = modal.querySelector('#signupTab');
  const loginForm = modal.querySelector('#loginForm');
  const signupForm = modal.querySelector('#signupForm');

  // Show modal
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
  });

  // Close modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Tab switching
  if (loginTab && signupTab) {
    loginTab.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
    });

    signupTab.addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
    });
  }

  // Handle form submissions
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = modal.querySelector('#loginEmail').value;
      alert(`Logged in as ${email}`);
      modal.style.display = 'none';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#signupName').value;
      alert(`Account created for ${name}`);
      modal.style.display = 'none';
    });
  }
}
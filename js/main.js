/**
 * TALFE ARQUITETURA - INTERACTION ENGINE (Supabase Integration)
 * Taste Skill (v2) Compliant Motion & Interaction Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Navigation Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Active Nav Link on Scroll via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // 4. Project Modal Data & Handlers
  // Fallback local database (usado se o Supabase estiver vazio)
  const localProjectDatabase = {
    'nature': {
      title: 'Suíte Air Nature',
      tag: 'Residencial',
      specs: 'Interiores · Integração Orgânica',
      images: [
        'imagens para portifólio/Suíte Air Nature.jpeg',
        'imagens para portifólio/Suíte Air Nature 1.jpeg',
        'imagens para portifólio/Suíte Air Nature 2.jpeg',
        'imagens para portifólio/Suíte Air Nature 3.jpeg',
        'imagens para portifólio/Suíte Air Nature 4.jpeg',
        'imagens para portifólio/Suíte Air Nature 5.jpeg'
      ],
      desc: 'Ambiente leve e integrado à natureza, proporcionando conforto e tranquilidade com uso de materiais orgânicos.'
    },
    'soft': {
      title: 'Quarto Soft',
      tag: 'Interiores',
      specs: 'Interiores · Texturas Suaves',
      images: [
        'imagens para portifólio/Quarto Soft.jpeg',
        'imagens para portifólio/Quarto Soft 2.jpeg',
        'imagens para portifólio/Quarto Soft 3.jpeg',
        'imagens para portifólio/Quarto Soft 4.jpeg'
      ],
      desc: 'Espaço íntimo projetado com texturas suaves e iluminação acolhedora para máximo relaxamento.'
    },
    'green': {
      title: 'Banheiro Green Light',
      tag: 'Interiores',
      specs: 'Interiores · Design Biofílico',
      images: [
        'imagens para portifólio/Banheiro Green Light.jpeg',
        'imagens para portifólio/Banheiro Green Light 2.jpeg',
        'imagens para portifólio/Banheiro Green Light 3.jpeg',
        'imagens para portifólio/Banheiro Green Light4.jpeg'
      ],
      desc: 'Refúgio particular com elementos naturais, unindo funcionalidade e design biofílico.'
    },
    'zenith': {
      title: 'Pavilhão Zenital',
      tag: 'Estudo de Luz',
      specs: '540 m² · Belo Horizonte · Concreto Aparente · Clarabóias Geométricas',
      images: ['assets/images/project-zenith.jpg'],
      desc: 'Experimento volumétrico com rasgos de iluminação superior que projetam padrões dinâmicos de luz e sombra ao longo das estações do ano.'
    },
    'brise': {
      title: 'Casa das Brises',
      tag: 'Biofilia & Conforto',
      specs: '410 m² · Brasília · Painéis Cinéticos · Jardim Integrado',
      images: ['assets/images/project-brise.jpg'],
      desc: 'Painéis articulados em madeira que respondem à incidência solar, proporcionando conforto térmico passivo e diálogo constante com a vegetação nativa.'
    },
    'minimal': {
      title: 'Galeria Minimal',
      tag: 'Espaço Cultural',
      specs: '280 m² · Porto Alegre · Travertino Claro · Luz Difusa',
      images: ['assets/images/project-minimal.jpg'],
      desc: 'Espaço expositivo com iluminação perimetral suave e planos brancos que valorizam obras de arte e o silêncio visual.'
    }
  };

  // Dynamic project database (loaded from Supabase)
  let projectDatabase = { ...localProjectDatabase };

  // Load projects from Supabase and update cards dynamically
  async function loadProjectsFromSupabase() {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (!projects || projects.length === 0) return; // Keep local fallback

      // Rebuild projectDatabase from Supabase data
      projectDatabase = {};
      projects.forEach(project => {
        projectDatabase[project.slug] = {
          title: project.title,
          tag: project.tag,
          specs: project.specs,
          images: Array.isArray(project.images) ? project.images : [project.images].filter(Boolean),
          desc: project.description,
          category: project.category,
          featured: project.featured
        };
      });

      // Render featured projects into the portfolio grid
      const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
      if (featuredProjects.length > 0) {
        renderProjectCards(featuredProjects);
      }

    } catch (err) {
      console.warn('Supabase project load failed, using local data:', err.message);
    }
  }

  function renderProjectCards(projects) {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = projects.map(project => {
      const firstImage = Array.isArray(project.images) ? project.images[0] : project.images;
      return `
        <article class="project-card">
          <div class="project-media">
            <img src="${firstImage || ''}" alt="${project.title}" loading="lazy">
            <span class="project-tag">${project.tag || ''}</span>
          </div>
          <div class="project-meta">
            <div>
              <div class="project-header-info">
                <h3 class="project-name">${project.title}</h3>
              </div>
              <p class="project-summary">${project.description || ''}</p>
            </div>
            <div class="project-specs">
              <a href="#" data-project-id="${project.slug}" style="margin-left: auto; text-decoration: underline;">Ver detalhes</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-bind modal triggers after dynamic render
    grid.querySelectorAll('[data-project-id]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openProjectModal(trigger.getAttribute('data-project-id'));
      });
    });
  }

  // Modal elements
  const modalOverlay = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalDesc = document.getElementById('modalDesc');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');

  let currentCarouselImages = [];
  let currentCarouselIndex = 0;

  function updateCarouselImage() {
    if (currentCarouselImages.length > 0) {
      modalImg.src = currentCarouselImages[currentCarouselIndex];
    }
  }

  if (carouselPrev && carouselNext) {
    carouselPrev.addEventListener('click', () => {
      if (currentCarouselImages.length > 1) {
        currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
        updateCarouselImage();
      }
    });

    carouselNext.addEventListener('click', () => {
      if (currentCarouselImages.length > 1) {
        currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
        updateCarouselImage();
      }
    });
  }

  function openProjectModal(projectId) {
    const data = projectDatabase[projectId];
    if (!data || !modalOverlay) return;

    const images = data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []);
    currentCarouselImages = images;
    currentCarouselIndex = 0;
    updateCarouselImage();

    if (images.length > 1) {
      carouselPrev.style.display = 'block';
      carouselNext.style.display = 'block';
    } else {
      carouselPrev.style.display = 'none';
      carouselNext.style.display = 'none';
    }

    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalSpecs.textContent = data.specs;
    modalDesc.textContent = data.desc;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bind static project triggers
  document.querySelectorAll('[data-project-id]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectModal(trigger.getAttribute('data-project-id'));
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProjectModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeProjectModal();
    }
  });

  // 5. Contact Form - Supabase Integration
  const contactForm = document.getElementById('contactForm');
  const toastNotice = document.getElementById('toastNotice');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalHTML = submitBtn.innerHTML;

      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const projectType = document.getElementById('projectType').value;
      const message = document.getElementById('userMessage').value.trim();

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Enviando...</span>';

      try {
        const { error } = await supabase
          .from('contacts')
          .insert([{ name, email, project_type: projectType, message }]);

        if (error) throw error;

        contactForm.reset();
        showToast('✓ Mensagem enviada com sucesso! Entraremos em contato em breve.');
      } catch (err) {
        console.error('Erro ao enviar:', err);
        showToast('⚠ Ocorreu um erro. Por favor, tente novamente.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }

  function showToast(message, isError = false) {
    if (!toastNotice) return;
    toastNotice.querySelector('span:last-child').textContent = message;
    toastNotice.style.background = isError ? 'rgba(180, 60, 60, 0.95)' : '';
    toastNotice.classList.add('show');
    setTimeout(() => toastNotice.classList.remove('show'), 5000);
  }

  // 6. Interactive 3D Architectural Window Depth Engine
  function initHeroWindowDepth() {
    const heroVisual = document.getElementById('heroVisual');
    const heroCard = document.getElementById('heroWindowCard');
    const toggleBtn = document.getElementById('depthModeToggle');
    const toggleLabel = document.getElementById('toggleLabel');

    if (!heroVisual || !heroCard) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interactive Blueprint Mode Toggle
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isBlueprint = heroCard.classList.toggle('is-blueprint');
        if (toggleLabel) {
          toggleLabel.textContent = isBlueprint ? 'Raio-X Ativo' : 'Camadas 3D';
        }
      });
    }

    if (prefersReducedMotion) {
      heroCard.classList.remove('is-ambient');
      return;
    }

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    let targetImgTx = 0;
    let targetImgTy = 0;
    let currentImgTx = 0;
    let currentImgTy = 0;

    let targetDatumTx = 0;
    let targetDatumTy = 0;
    let currentDatumTx = 0;
    let currentDatumTy = 0;

    let targetCardTx = 0;
    let targetCardTy = 0;
    let currentCardTx = 0;
    let currentCardTy = 0;

    let sheenX = 75;
    let sheenY = 25;
    let currentSheenX = 75;
    let currentSheenY = 25;

    let isHovering = false;
    let rafId = null;

    const LERP_FACTOR = 0.09;

    function updatePhysics() {
      // Smooth interpolation for spring tilt
      currentRotX += (targetRotX - currentRotX) * LERP_FACTOR;
      currentRotY += (targetRotY - currentRotY) * LERP_FACTOR;

      currentImgTx += (targetImgTx - currentImgTx) * LERP_FACTOR;
      currentImgTy += (targetImgTy - currentImgTy) * LERP_FACTOR;

      currentDatumTx += (targetDatumTx - currentDatumTx) * LERP_FACTOR;
      currentDatumTy += (targetDatumTy - currentDatumTy) * LERP_FACTOR;

      currentCardTx += (targetCardTx - currentCardTx) * LERP_FACTOR;
      currentCardTy += (targetCardTy - currentCardTy) * LERP_FACTOR;

      currentSheenX += (sheenX - currentSheenX) * LERP_FACTOR;
      currentSheenY += (sheenY - currentSheenY) * LERP_FACTOR;

      // Apply 3D transforms via CSS properties
      heroCard.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      heroCard.style.setProperty('--img-tx', `${currentImgTx.toFixed(2)}px`);
      heroCard.style.setProperty('--img-ty', `${currentImgTy.toFixed(2)}px`);
      heroCard.style.setProperty('--datum-tx', `${currentDatumTx.toFixed(2)}px`);
      heroCard.style.setProperty('--datum-ty', `${currentDatumTy.toFixed(2)}px`);
      heroCard.style.setProperty('--card-tx', `${currentCardTx.toFixed(2)}px`);
      heroCard.style.setProperty('--card-ty', `${currentCardTy.toFixed(2)}px`);
      heroCard.style.setProperty('--sheen-x', `${currentSheenX.toFixed(1)}%`);
      heroCard.style.setProperty('--sheen-y', `${currentSheenY.toFixed(1)}%`);

      // Keep animation running while hovering or until values settle
      const isSettled =
        Math.abs(targetRotX - currentRotX) < 0.02 &&
        Math.abs(targetRotY - currentRotY) < 0.02;

      if (isHovering || !isSettled) {
        rafId = requestAnimationFrame(updatePhysics);
      } else {
        rafId = null;
        if (!isHovering) {
          heroCard.classList.add('is-ambient');
        }
      }
    }

    function handleMouseMove(e) {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates (-0.5 to 0.5)
      const nx = Math.max(-0.5, Math.min(0.5, (x / rect.width) - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (y / rect.height) - 0.5));

      // 3D Rotation angles (degrees)
      targetRotX = -ny * 14;
      targetRotY = nx * 16;

      // Differential parallax offsets across depth layers
      targetImgTx = -nx * 20; // counter-parallax for background
      targetImgTy = -ny * 20;

      targetDatumTx = nx * 14; // mid-layer datum float
      targetDatumTy = ny * 14;

      targetCardTx = nx * 22; // foreground card float
      targetCardTy = ny * 22;

      // Light sheen reflection position
      sheenX = (nx + 0.5) * 100;
      sheenY = (ny + 0.5) * 100;

      if (!isHovering) {
        isHovering = true;
        heroCard.classList.remove('is-ambient');
        if (!rafId) {
          rafId = requestAnimationFrame(updatePhysics);
        }
      }
    }

    function handleMouseLeave() {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
      targetImgTx = 0;
      targetImgTy = 0;
      targetDatumTx = 0;
      targetDatumTy = 0;
      targetCardTx = 0;
      targetCardTy = 0;
      sheenX = 75;
      sheenY = 25;

      if (!rafId) {
        rafId = requestAnimationFrame(updatePhysics);
      }
    }

    heroVisual.addEventListener('mousemove', handleMouseMove, { passive: true });
    heroVisual.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Touch device support (touchmove)
    heroVisual.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMouseMove(e.touches[0]);
      }
    }, { passive: true });

    heroVisual.addEventListener('touchend', handleMouseLeave, { passive: true });
  }

  // Initialize depth engine
  initHeroWindowDepth();

  // Initialize Supabase data load
  loadProjectsFromSupabase();
});

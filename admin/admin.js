/**
 * TALFE ADMIN PANEL - JavaScript Logic
 * Auth, CRUD de projetos, upload de imagens, leitura de contatos
 */

const STORAGE_BUCKET = 'project-images';

// ================================
// DOM References
// ================================
const loginScreen     = document.getElementById('loginScreen');
const adminDashboard  = document.getElementById('adminDashboard');
const loginForm       = document.getElementById('loginForm');
const loginError      = document.getElementById('loginError');
const loginBtn        = document.getElementById('loginBtn');
const logoutBtn       = document.getElementById('logoutBtn');
const adminUserEmail  = document.getElementById('adminUserEmail');

// Tabs
const navItems        = document.querySelectorAll('.nav-item');
const tabPanels       = document.querySelectorAll('.tab-panel');

// Contacts
const contactsList    = document.getElementById('contactsList');
const contactsBadge   = document.getElementById('contactsBadge');
const refreshContacts = document.getElementById('refreshContacts');

// Projects
const projectsGrid    = document.getElementById('projectsAdminGrid');
const goToNewProject  = document.getElementById('goToNewProject');

// Project Form
const projectForm     = document.getElementById('projectForm');
const projectFormTitle = document.getElementById('projectFormTitle');
const editProjectId   = document.getElementById('editProjectId');
const projTitle       = document.getElementById('projTitle');
const projSlug        = document.getElementById('projSlug');
const projTag         = document.getElementById('projTag');
const projCategory    = document.getElementById('projCategory');
const projSpecs       = document.getElementById('projSpecs');
const projDesc        = document.getElementById('projDesc');
const projFeatured    = document.getElementById('projFeatured');
const projSortOrder   = document.getElementById('projSortOrder');
const projImagesInput = document.getElementById('projImages');
const imagesPreview   = document.getElementById('imagesPreview');
const uploadZone      = document.getElementById('uploadZone');
const imageUpload     = document.getElementById('imageUpload');
const uploadProgress  = document.getElementById('uploadProgress');
const uploadPrompt    = document.getElementById('uploadPrompt');
const progressFill    = document.getElementById('progressFill');
const progressText    = document.getElementById('progressText');
const saveProjectBtn  = document.getElementById('saveProjectBtn');
const cancelEdit      = document.getElementById('cancelEdit');
const formMessage     = document.getElementById('formMessage');

// Delete Modal
const confirmModal    = document.getElementById('confirmModal');
const cancelDelete    = document.getElementById('cancelDelete');
const confirmDelete   = document.getElementById('confirmDelete');

// State
let currentImages = [];
let deleteProjectId = null;

// ================================
// AUTH
// ================================

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminDashboard.style.display = 'none';
}

function showDashboard(user) {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'grid';
  if (adminUserEmail) adminUserEmail.textContent = user.email;
  loadContacts();
  loadProjects();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.querySelector('span').textContent = 'Entrando...';

  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = 'E-mail ou senha inválidos.';
    loginBtn.disabled = false;
    loginBtn.querySelector('span').textContent = 'Entrar';
    return;
  }

  showDashboard(data.user);
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  showLogin();
});

// ================================
// TAB NAVIGATION
// ================================

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.getAttribute('data-tab');
    navItems.forEach(n => n.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`panel${capitalize(tabId.replace('-', ''))}`).classList.add('active');
  });
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function switchTab(tabId) {
  navItems.forEach(n => {
    n.classList.toggle('active', n.getAttribute('data-tab') === tabId);
  });
  tabPanels.forEach(p => p.classList.remove('active'));
  const panelMap = {
    'contacts': 'panelContacts',
    'projects': 'panelProjects',
    'new-project': 'panelNewProject'
  };
  document.getElementById(panelMap[tabId]).classList.add('active');
}

goToNewProject.addEventListener('click', () => {
  resetProjectForm();
  switchTab('new-project');
});

cancelEdit.addEventListener('click', () => {
  resetProjectForm();
  switchTab('projects');
});

// ================================
// CONTACTS
// ================================

async function loadContacts() {
  contactsList.innerHTML = '<div class="loading-state">Carregando mensagens...</div>';

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    contactsList.innerHTML = `<div class="empty-state">Erro ao carregar: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✉</span>
        Nenhuma mensagem ainda.
      </div>`;
    return;
  }

  // Update badge
  contactsBadge.textContent = data.length;
  contactsBadge.style.display = 'inline-block';

  const typeLabels = {
    'residencial': 'Residencial',
    'reforma': 'Reforma/Interiores',
    'corporativo': 'Corporativo',
    'consultoria': 'Consultoria',
  };

  contactsList.innerHTML = data.map(c => {
    const date = new Date(c.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="contact-card">
        <div class="contact-card-header">
          <div>
            <div class="contact-name">${escapeHtml(c.name)}</div>
            <div class="contact-email">${escapeHtml(c.email)}</div>
          </div>
          <div class="contact-meta">
            <span class="contact-date">${date}</span>
            ${c.project_type ? `<span class="contact-type">${typeLabels[c.project_type] || c.project_type}</span>` : ''}
          </div>
        </div>
        <div class="contact-message">${escapeHtml(c.message)}</div>
      </div>
    `;
  }).join('');
}

refreshContacts.addEventListener('click', loadContacts);

// ================================
// PROJECTS
// ================================

async function loadProjects() {
  projectsGrid.innerHTML = '<div class="loading-state">Carregando projetos...</div>';

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    projectsGrid.innerHTML = `<div class="empty-state">Erro: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <span class="empty-icon">◫</span>
        Nenhum projeto cadastrado. Crie o primeiro!
      </div>`;
    return;
  }

  projectsGrid.innerHTML = data.map(project => {
    const thumb = Array.isArray(project.images) && project.images.length > 0
      ? project.images[0] : null;
    return `
      <div class="project-admin-card">
        ${thumb
          ? `<img src="${escapeHtml(thumb)}" class="project-admin-thumb" alt="${escapeHtml(project.title)}" loading="lazy">`
          : `<div class="project-admin-thumb-placeholder">◫</div>`}
        <div class="project-admin-body">
          <div class="project-admin-title">${escapeHtml(project.title)}</div>
          <div class="project-admin-meta">
            ${project.tag ? escapeHtml(project.tag) + ' · ' : ''}
            ${project.featured ? '★ Destaque' : ''}
          </div>
          <div class="project-admin-actions">
            <button class="btn-edit" onclick="editProject('${project.id}')">Editar</button>
            <button class="btn-delete" onclick="promptDeleteProject('${project.id}')">Excluir</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.editProject = async function(id) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error || !data) { alert('Erro ao carregar projeto.'); return; }

  projectFormTitle.textContent = 'Editar Projeto';
  editProjectId.value = data.id;
  projTitle.value = data.title || '';
  projSlug.value = data.slug || '';
  projTag.value = data.tag || '';
  projCategory.value = data.category || 'residencial';
  projSpecs.value = data.specs || '';
  projDesc.value = data.description || '';
  projFeatured.checked = !!data.featured;
  projSortOrder.value = data.sort_order || 0;

  currentImages = Array.isArray(data.images) ? [...data.images] : [];
  projImagesInput.value = JSON.stringify(currentImages);
  renderImagePreviews();

  switchTab('new-project');
};

window.promptDeleteProject = function(id) {
  deleteProjectId = id;
  confirmModal.style.display = 'flex';
};

cancelDelete.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  deleteProjectId = null;
});

confirmDelete.addEventListener('click', async () => {
  if (!deleteProjectId) return;
  const { error } = await supabase.from('projects').delete().eq('id', deleteProjectId);
  confirmModal.style.display = 'none';
  deleteProjectId = null;
  if (error) { alert('Erro ao excluir: ' + error.message); return; }
  loadProjects();
  switchTab('projects');
});

// ================================
// IMAGE UPLOAD
// ================================

uploadZone.addEventListener('click', () => imageUpload.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = 'var(--accent)';
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.style.borderColor = '';
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  uploadFiles(files);
});

imageUpload.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  uploadFiles(files);
  imageUpload.value = '';
});

async function uploadFiles(files) {
  if (!files.length) return;

  uploadPrompt.style.display = 'none';
  uploadProgress.style.display = 'block';
  progressFill.style.width = '0%';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progressText.textContent = `Enviando ${i + 1} de ${files.length}: ${file.name}`;
    progressFill.style.width = `${((i) / files.length) * 100}%`;

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = `projects/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      currentImages.push(urlData.publicUrl);
    }
  }

  progressFill.style.width = '100%';
  progressText.textContent = 'Concluido!';

  setTimeout(() => {
    uploadProgress.style.display = 'none';
    uploadPrompt.style.display = 'block';
  }, 1500);

  projImagesInput.value = JSON.stringify(currentImages);
  renderImagePreviews();
}

function renderImagePreviews() {
  imagesPreview.innerHTML = currentImages.map((url, index) => `
    <div class="preview-item">
      <img src="${escapeHtml(url)}" alt="Imagem ${index + 1}">
      <button class="preview-remove" onclick="removeImage(${index})" title="Remover">✕</button>
    </div>
  `).join('');
}

window.removeImage = function(index) {
  currentImages.splice(index, 1);
  projImagesInput.value = JSON.stringify(currentImages);
  renderImagePreviews();
};

// ================================
// PROJECT FORM SAVE
// ================================

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveProjectBtn.disabled = true;
  saveProjectBtn.querySelector('span').textContent = 'Salvando...';
  formMessage.className = 'form-message';
  formMessage.textContent = '';

  const payload = {
    title: projTitle.value.trim(),
    slug: projSlug.value.trim().toLowerCase(),
    tag: projTag.value.trim(),
    category: projCategory.value,
    specs: projSpecs.value.trim(),
    description: projDesc.value.trim(),
    featured: projFeatured.checked,
    sort_order: parseInt(projSortOrder.value) || 0,
    images: JSON.parse(projImagesInput.value || '[]')
  };

  let error;
  const id = editProjectId.value;

  if (id) {
    ({ error } = await supabase.from('projects').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('projects').insert([payload]));
  }

  saveProjectBtn.disabled = false;
  saveProjectBtn.querySelector('span').textContent = 'Salvar Projeto';

  if (error) {
    formMessage.textContent = 'Erro ao salvar: ' + error.message;
    formMessage.className = 'form-message error';
    return;
  }

  formMessage.textContent = id ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!';
  formMessage.className = 'form-message success';

  loadProjects();
  setTimeout(() => {
    resetProjectForm();
    switchTab('projects');
  }, 1500);
});

function resetProjectForm() {
  projectFormTitle.textContent = 'Novo Projeto';
  editProjectId.value = '';
  projectForm.reset();
  currentImages = [];
  projImagesInput.value = '[]';
  imagesPreview.innerHTML = '';
  formMessage.className = 'form-message';
  formMessage.textContent = '';
}

// Auto-slug from title
projTitle.addEventListener('input', () => {
  if (!editProjectId.value) {
    projSlug.value = projTitle.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

// ================================
// UTILS
// ================================

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ================================
// INIT
// ================================
checkSession();

// Global navigation setup
function setupNav() {
  const navHTML = `
    <nav class="global-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 0.75rem;">
            <img src="logo-small.svg" alt="WhatNext" style="height:40px;width:auto;">
            <span style="font-family: 'Arimo', Arial, sans-serif; font-size: 1.1rem; font-weight: 600; color: #1a1a1a;">WhatNext</span>
          </a>
        </div>
        <div class="nav-links">
          <a href="index.html" class="nav-link" id="homeLink">Home</a>
          <a href="about.html" class="nav-link" id="aboutLink">About</a>
          <a href="goals.html" class="nav-link" id="goalsLink">Goals</a>
          <a href="profile.html" class="nav-link" id="profileLink">Profile</a>
          <button onclick="logoutNav()" class="nav-logout">Logout</button>
        </div>
      </div>
    </nav>
  `;

  const nav = document.createElement('div');
  nav.innerHTML = navHTML;
  document.body.insertBefore(nav.firstElementChild, document.body.firstChild);

  // Highlight current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'index.html' || path === '') {
    document.getElementById('homeLink')?.classList.add('active');
  } else if (path === 'goals.html') {
    document.getElementById('goalsLink')?.classList.add('active');
  } else if (path === 'profile.html') {
    document.getElementById('profileLink')?.classList.add('active');
  } else if (path === 'about.html') {
    document.getElementById('aboutLink')?.classList.add('active');
  }
}

window.logoutNav = async function() {
  try {
    const { auth, signOut } = await import('./firebase-config.js');
    await signOut(auth);
    localStorage.clear();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Add nav styles
const style = document.createElement('style');
style.textContent = `
  .global-nav {
    background: #F5EFE6;
    border-bottom: 1px solid #D8D3CA;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .nav-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    font-weight: 600;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .nav-link {
    font-family: 'Arimo', Arial, sans-serif;
    color: #5a5a5a;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #1a1a1a;
  }

  .nav-link.active {
    color: #1a1a1a;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 2px;
  }

  .nav-logout {
    font-family: 'Arimo', Arial, sans-serif;
    padding: 0.5rem 1rem;
    background: #2d2d2d;
    border: none;
    color: #F5EFE6;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-logout:hover {
    background: #1a1a1a;
  }

  body {
    padding-top: 0;
  }
`;
document.head.appendChild(style);

// Initialize nav when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNav);
} else {
  setupNav();
}

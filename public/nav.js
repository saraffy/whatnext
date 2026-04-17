// Global navigation setup
function setupNav() {
  const navHTML = `
    <nav class="global-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <a href="index.html" style="text-decoration: none; color: #4f8ef7; font-weight: 600; font-size: 1.1rem;">🎯 WhatNext</a>
        </div>
        <div class="nav-links">
          <a href="index.html" class="nav-link" id="homeLink">Home</a>
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
    background: #1a1a1a;
    border-bottom: 2px solid #333;
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
    color: #999;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #4f8ef7;
  }

  .nav-link.active {
    color: #4f8ef7;
    border-bottom: 2px solid #4f8ef7;
    padding-bottom: 2px;
  }

  .nav-logout {
    padding: 0.5rem 1rem;
    background: #333;
    border: 1px solid #444;
    color: #e8e8e8;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-logout:hover {
    background: #444;
    border-color: #555;
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

// Check if user is already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
  window.location.href = '../index.html';
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Hide any existing messages
  hideMessages();

  // Simple validation
  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  // Demo authentication (in real app, this would be server-side)
  if (username === 'demo' && password === '123456') {
    // Store login status
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', username);

    showSuccess('Login successful! Redirecting...');

    // Redirect to main page after 1 second
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  } else {
    showError('Invalid username or password. Try demo/123456');
  }
}

function showRegister() {
  alert('Registration feature coming soon! For now, use demo credentials:\nUsername: demo\nPassword: 123456');
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

// Add keyboard support for Enter key
document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    handleLogin(e);
  }
}); 
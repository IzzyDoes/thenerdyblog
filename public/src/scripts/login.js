document.addEventListener('DOMContentLoaded', () => {
        // Get the form elements
        const form = document.querySelector('form');
        const usernameInput = form.querySelector('input[type="text"]'); // Username field
        const passwordInput = form.querySelector('input[type="password"]');
        const submitButton = form.querySelector('button');
        const registerLink = document.querySelector('a[href="#"]'); // Register link
        const loginButton = document.querySelector('#loginBtn'); // Login button in the navbar

        let isRegistering = false;

        // Hide login button if the user is already logged in
        const token = localStorage.getItem('token');
        if (token && loginButton) {
                loginButton.style.display = 'none'; // Hide login button if token exists
        }

        // Toggle between login and register mode
        registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                isRegistering = !isRegistering;
                if (isRegistering) {
                        submitButton.textContent = 'Register';
                        registerLink.textContent = 'Already have an account? Login';
                } else {
                        submitButton.textContent = 'Sign In';
                        registerLink.textContent = 'Don\'t have an account? Register';
                }
        });

        // Handle form submission (login or register)
        form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = usernameInput.value; // Username input
                const password = passwordInput.value;

                const endpoint = isRegistering
                        ? 'http://localhost:5000/api/auth/register'
                        : 'http://localhost:5000/api/auth/login';

                const bodyData = JSON.stringify({
                        username: username,
                        password: password
                });

                try {
                        const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json'
                                },
                                body: bodyData
                        });

                        const data = await response.json();

                        if (response.ok) {
                                if (!isRegistering) {
                                        // Store token and user role in localStorage
                                        localStorage.setItem('token', data.token); // Store the token
                                        localStorage.setItem('role', data.role); // Store the role

                                        // Check the role to redirect user accordingly
                                        if (data.role === 'admin') {
                                                window.location.href = '../pages/admin.html'; // Redirect to admin page
                                        } else {
                                                window.location.href = '../pages/index.html'; // Redirect to homepage
                                        }
                                } else {
                                        alert('Registration successful! You can now login.');
                                        registerLink.click(); // Toggle back to login
                                }
                        } else {
                                alert(data.message || 'An error occurred. Please try again.');
                        }
                } catch (error) {
                        console.error('Error during form submission:', error);
                        alert('An error occurred. Please try again.');
                }
        });
});

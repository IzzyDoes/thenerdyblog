document.addEventListener('DOMContentLoaded', () => {
        const logoutButton = document.getElementById('logoutBtn');
        const token = localStorage.getItem('token'); // Get the token from localStorage

        // Show the Logout button only if the user is logged in (i.e., a token exists)
        if (token) {
                if (logoutButton) {
                        logoutButton.style.display = 'block'; // Show the Logout button
                }
        } else {
                if (logoutButton) {
                        logoutButton.style.display = 'none'; // Hide the Logout button
                }
        }

        // Handle logout functionality
        if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                        localStorage.removeItem('token'); // Remove JWT token from localStorage
                        localStorage.removeItem('role');  // Remove user role from localStorage
                        window.location.href = '../pages/index.html'; // Redirect to login page
                });
        }
});

// Show loading spinner before any DOM manipulation
const loadingScreen = document.getElementById("loadingScreen");
if (loadingScreen) loadingScreen.style.display = "flex"; // Show loading screen

// Function to remove HTML tags and return plain text
function stripHtmlTags(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
}

// Run DOM manipulations after DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
        // Pagination settings
        const postsPerPage = 5;
        let currentPage = 1;
        let totalPages = 1;

        // Hide loading spinner after DOM content is ready
        if (loadingScreen) loadingScreen.style.display = "none"; // Hide loading screen

        // Get login and admin buttons
        const loginButton = document.querySelector('#loginBtn');
        const adminButton = document.querySelector('#adminBtn');
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin';

        // Toggle login button visibility based on token
        if (token && loginButton) {
                loginButton.style.display = 'none';
        } else if (loginButton) {
                loginButton.style.display = 'block';
        }

        // Toggle admin button visibility based on role
        if (isAdmin && token && adminButton) {
                adminButton.style.display = 'block';
        } else if (adminButton) {
                adminButton.style.display = 'none';
        }

        // Get blog template and container
        const blogTemplate = document.querySelector('.blog-template');
        const blogContainer = document.querySelector('.card-container-main .px-4');
        const paginationContainer = document.createElement('div');
        paginationContainer.classList.add('flex', 'justify-center', 'mt-10', 'space-x-2');
        blogContainer.parentElement.appendChild(paginationContainer);

        // Fetch and render posts for a specific page
        async function fetchAndRenderPage(page) {
                if (loadingScreen) loadingScreen.style.display = "flex"; // Show loading spinner
                try {
                        const response = await fetch(`http://localhost:5000/api/posts?page=${page}&limit=${postsPerPage}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Failed to fetch posts');

                        const data = await response.json();
                        const blogContent = data.posts;
                        totalPages = data.totalPages;
                        blogContainer.innerHTML = '';

                        blogContent.forEach(({ _id, title, description, category, createdAt }) => {
                                const blogClone = blogTemplate.cloneNode(true);
                                blogClone.classList.remove('hidden');
                                blogClone.querySelector('#blogCategory').textContent = category || 'Uncategorized';
                                blogClone.querySelector('#datePublished').textContent = new Date(createdAt).toLocaleDateString();
                                blogClone.querySelector('#blogTitle').textContent = title || 'No Title';

                                // Strip HTML from the description
                                const plainDescription = stripHtmlTags(description);
                                blogClone.querySelector('#blogDescription').textContent = plainDescription.length > 150 ? `${plainDescription.substring(0, 150)}...` : plainDescription;

                                blogClone.querySelector('a[aria-label="Article"]').href = `blog.html?id=${_id}`;

                                const editButton = blogClone.querySelector('#editBtn');
                                const deleteButton = blogClone.querySelector('#deleteBtn');
                                if (isAdmin) {
                                        editButton.style.display = 'block';
                                        deleteButton.style.display = 'block';
                                        deleteButton.addEventListener('click', async () => {
                                                try {
                                                        const deleteResponse = await fetch(`http://localhost:5000/api/posts/${_id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (!deleteResponse.ok) throw new Error('Failed to delete post');
                                                        blogContainer.removeChild(blogClone);
                                                } catch (error) {
                                                        console.error('Error deleting post', error);
                                                }
                                        });
                                }
                                blogContainer.appendChild(blogClone);
                        });
                        createPaginationControls();
                } catch (error) {
                        console.error("Error fetching data", error);
                        blogContainer.innerHTML = '<p class="text-red-500">Failed to load posts. Please try again later.</p>';
                } finally {
                        if (loadingScreen) loadingScreen.style.display = "none"; // Hide loading spinner after fetch
                }
        }

        function createPaginationControls() {
                paginationContainer.innerHTML = '';
                for (let page = 1; page <= totalPages; page++) {
                        const pageButton = document.createElement('button');
                        pageButton.textContent = page;
                        pageButton.classList.add('btn', 'btn-sm', 'btn-outline', 'mr-2', 'mb-2');
                        if (page === currentPage) pageButton.classList.add('btn-primary');
                        pageButton.addEventListener('click', () => {
                                if (page !== currentPage) {
                                        currentPage = page;
                                        fetchAndRenderPage(currentPage);
                                }
                        });
                        paginationContainer.appendChild(pageButton);
                }
        }

        fetchAndRenderPage(currentPage);
});

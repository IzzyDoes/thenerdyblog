const debounce = (func, delay) => {
        let timeoutID;
        return (...args) => {
                if (timeoutID) clearTimeout(timeoutID);
                timeoutID = setTimeout(() => {
                        func.apply(this, args);
                }, delay);
        };
};

const performSearch = async (query) => {
        if (!query) {
                // If the query is empty, fetch and display all posts
                await fetchAndRenderAllPosts();
                return;
        }
        try {
                const response = await fetch(`http://localhost:5000/api/posts/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) { throw new Error('Network response was not ok'); }
                const data = await response.json();
                displayResults(data.searchResult); // Adjusting to the correct key in response
        } catch (error) {
                console.error('Error fetching search results:', error);
                displayResults([]);
        }
};

const displayResults = (posts) => {
        const blogContainer = document.querySelector('.card-container-main .px-4');
        blogContainer.innerHTML = ''; // Clear previous results

        if (posts.length === 0) {
                blogContainer.innerHTML = '<p class="text-red-500">No posts found.</p>';
                return;
        }

        posts.forEach(({ _id, title, description, createdAt }) => {
                const blogClone = document.createElement('div');
                blogClone.classList.add('blog-template', 'mb-10', 'border-t', 'border-b', 'divide-y');
                const plainDescription = stripHtmlTags(description); // Function to strip HTML tags
                const excerpt = plainDescription.length > 150 ? `${plainDescription.substring(0, 150)}...` : plainDescription;

                blogClone.innerHTML = `
            <div class="grid py-8 sm:grid-cols-4">
                <div class="mb-4 sm:mb-0">
                    <div class="space-y-1 text-xs font-semibold tracking-wide uppercase">
                        <p class="date-published text-gray-400" id="datePublished">${new Date(createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="sm:col-span-3 lg:col-span-2">
                    <div class="mb-3">
                        <a href="blog.html?id=${_id}" aria-label="Article" class="inline-block text-gray-300 transition-colors duration-200 hover:text-deep-purple-accent-700 hover:opacity-60 cursor-pointer">
                            <p class="text-3xl font-extrabold leading-none sm:text-4xl xl:text-4xl" id="blogTitle">${title || 'No Title'}</p>
                        </a>
                    </div>
                    <p class="text-info opacity-40" id="blogDescription">${excerpt}</p>
                </div>
            </div>
        `;
                blogContainer.appendChild(blogClone);
        });
};

// Function to fetch and render all posts
const fetchAndRenderAllPosts = async () => {
        try {
                const response = await fetch(`http://localhost:5000/api/posts`, {
                        method: 'GET'
                });
                if (!response.ok) throw new Error('Failed to fetch all posts');
                const data = await response.json();
                displayResults(data); // Assuming `data` is in the same format as search results
        } catch (error) {
                console.error('Error fetching all posts:', error);
        }
};

// Get the search input element
const searchInput = document.getElementById('search-input');

// Create a debounced version of the search function
const debouncedSearch = debounce(function (event) {
        const query = event.target.value.trim();
        performSearch(query);
}, 300); // 300 milliseconds delay

// Add event listener for input changes
searchInput.addEventListener('input', debouncedSearch);

// Handle Enter key for search
searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value.trim());
        }
});

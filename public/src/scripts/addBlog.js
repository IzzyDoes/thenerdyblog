document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('blogForm');
        const publishBtn = document.getElementById('publishBtn');
        const inlineImageUpload = document.getElementById('inlineImageUpload');

        // Initialize Quill editor
        const toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                ['blockquote', 'code-block'],
                ['link', 'image', 'video', 'formula'],
                [{ 'header': [1, 2, false] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean'] // remove formatting button
        ];

        const quill = new Quill('#editor', {
                theme: 'snow',
                modules: {
                        toolbar: toolbarOptions
                }
        });

        form.addEventListener('submit', async (e) => {
                e.preventDefault();

                publishBtn.textContent = 'Publishing...';
                publishBtn.disabled = true;

                // Get content from Quill editor
                const contentHtml = quill.root.innerHTML;
                const formData = new FormData(form);
                formData.append('description', contentHtml);

                const tagsInput = formData.get('tags') || '';
                const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                formData.set('tags', JSON.stringify(tagsArray));

                // Validate header image size
                const headerImageFile = formData.get('headerImage');
                if (headerImageFile && headerImageFile.size > 20 * 1024 * 1024) {
                        Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Header image size exceeds 20MB limit.',
                        });
                        publishBtn.disabled = false;
                        publishBtn.textContent = 'Save & Publish';
                        return;
                }

                try {
                        const response = await fetch('http://localhost:5000/api/posts', {
                                method: 'POST',
                                body: formData
                        });

                        if (!response.ok) {
                                const errorData = await response.json();
                                Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: errorData.message || 'Failed to publish post.',
                                });
                                throw new Error(errorData.message || 'Failed to publish post.');
                        }

                        Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Post published successfully!',
                        });

                        form.reset();
                        quill.setContents([]); // Reset Quill editor content

                } catch (error) {
                        console.error('Error:', error);
                } finally {
                        publishBtn.disabled = false;
                        publishBtn.textContent = 'Save & Publish';
                }
        });

        // Function to insert an inline image by clicking the hidden file input
        window.insertImage = () => {
                inlineImageUpload.click();
        };

        // Handle inline image insertion
        inlineImageUpload.addEventListener('change', async () => {
                const file = inlineImageUpload.files[0];
                if (file) {
                        const formData = new FormData();
                        formData.append('inlineImage', file);

                        try {
                                const uploadResponse = await fetch('http://localhost:5000/api/posts/upload-inline-image', {
                                        method: 'POST',
                                        body: formData
                                });

                                if (!uploadResponse.ok) {
                                        const errorData = await uploadResponse.json();
                                        alert(errorData.message || 'Image upload failed.');
                                        return;
                                }

                                const { imageUrl } = await uploadResponse.json();
                                // Insert the image URL into the Quill editor
                                const range = quill.getSelection();
                                quill.insertEmbed(range.index, 'image', imageUrl);

                        } catch (error) {
                                console.error('Error uploading inline image:', error);
                        }
                }
        });
});

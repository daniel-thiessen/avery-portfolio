// Main JavaScript file for the Artist Portfolio site

document.addEventListener('DOMContentLoaded', async () => {
    let config;
    
    // Try to load from CMS first, fallback to config.js
    if (window.contentLoader) {
        try {
            config = await window.contentLoader.getSiteConfig();
        } catch (error) {
            console.warn('Failed to load CMS content, using config.js:', error);
            config = window.siteConfig;
        }
    } else {
        // Fallback to original config.js
        config = window.siteConfig;
    }
    
    // Initialize the site
    initSite(config);
});

// Initialize the site with the provided configuration
function initSite(config) {
    // Create site structure
    const mainContent = document.querySelector('main') || document.createElement('main');
    mainContent.className = 'fade-in';
    
    // Create header
    createHeader(config);
    
    // Create sections
    createAboutSection(config.about);
    createCarouselSection('current', config.current);
    createCarouselSection('choreography', config.choreography);
    createCarouselSection('projects', config.projects);
    createCarouselSection('performances', config.performances);
    createContactSection(config.contact);
    
    // Create footer
    createFooter(config);
    
    // Initialize intersection observer for active section detection
    initSectionObserver();
}

// Create the site header
function createHeader(config) {
    const header = document.createElement('header');
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content';
    
    // Site title
    const title = document.createElement('h1');
    title.id = 'site-title';
    title.textContent = config.siteTitle;
    
    // Hamburger menu button
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        hamburger.appendChild(span);
    }
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        header.classList.toggle('menu-open');
        const nav = header.querySelector('nav');
        if (nav) nav.classList.toggle('open');
    });
    
    headerContent.appendChild(title);
    headerContent.appendChild(hamburger);
    header.appendChild(headerContent);
    
    // Navigation
    const nav = document.createElement('nav');
    const navList = document.createElement('ul');
    
    config.navigation.forEach(item => {
        const navItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.textContent = item.label;
        link.setAttribute('data-section', item.id);
        
        // Smooth scroll on navigation click
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById(item.id);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            }
        });
        
        navItem.appendChild(link);
        navList.appendChild(navItem);
    });
    
    nav.appendChild(navList);
    header.appendChild(nav);
    
    // Add header to page
    document.body.insertBefore(header, document.body.firstChild);
}

// Create About section
function createAboutSection(about) {
    const section = document.createElement('section');
    section.id = 'about';
    section.className = 'section';
    
    const heading = document.createElement('h2');
    heading.textContent = 'About';
    
    const content = document.createElement('div');
    content.className = 'about-content';
    
    // Profile image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'profile-image-container';
    
    const image = document.createElement('img');
    image.src = about.profileImage;
    image.alt = about.name;
    image.className = 'profile-image';
    image.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle'%3EProfile%3C/text%3E%3C/svg%3E";
    };
    
    imageContainer.appendChild(image);
    
    // Bio content
    const bioContainer = document.createElement('div');
    bioContainer.className = 'bio-container';
    
    const name = document.createElement('h3');
    name.textContent = about.name;
    
    const bio = document.createElement('p');
    bio.className = 'bio';
    bio.textContent = about.bio;
    
    const longBio = document.createElement('p');
    longBio.className = 'long-bio';
    longBio.textContent = about.longBio;
    
    bioContainer.appendChild(name);
    bioContainer.appendChild(bio);
    bioContainer.appendChild(longBio);
    
    content.appendChild(imageContainer);
    content.appendChild(bioContainer);
    
    section.appendChild(heading);
    section.appendChild(content);
    
    document.querySelector('main').appendChild(section);
}

// Create carousel section (Current, Choreography, Projects, Performances)
function createCarouselSection(id, sectionData) {
    const section = document.createElement('section');
    section.id = id;
    section.className = 'section carousel-section';
    
    const heading = document.createElement('h2');
    heading.textContent = sectionData.title;
    
    section.appendChild(heading);
    
    // Create carousel
    const carousel = createCarousel(sectionData.items);
    section.appendChild(carousel);
    
    document.querySelector('main').appendChild(section);
}

// Create a carousel component
function createCarousel(items) {
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';
    
    // Create left edge indicator
    const leftEdge = document.createElement('div');
    leftEdge.className = 'carousel-edge left';
    leftEdge.setAttribute('aria-hidden', 'true');
    
    // Create right edge indicator
    const rightEdge = document.createElement('div');
    rightEdge.className = 'carousel-edge right active';
    rightEdge.setAttribute('aria-hidden', 'true');
    
    carouselWrapper.appendChild(leftEdge);
    carouselWrapper.appendChild(rightEdge);
    
    // Create carousel items container
    const carouselItems = document.createElement('div');
    carouselItems.className = 'carousel-items';
    
    // Add items to carousel
    items.forEach(item => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.dataset.id = item.id;
        
        // Thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';
        
        // Thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.src = item.thumbnail;
        thumbnail.alt = item.title;
        thumbnail.className = 'thumbnail';
        thumbnail.onerror = function() {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E";
        };
        
        thumbnailContainer.appendChild(thumbnail);
        
        // Add video indicator if it's a video
        if (item.video) {
            const videoIndicator = document.createElement('div');
            videoIndicator.className = 'video-indicator';
            
            const videoIcon = document.createElement('span');
            videoIcon.textContent = '▶';
            
            videoIndicator.appendChild(videoIcon);
            thumbnailContainer.appendChild(videoIndicator);
        }
        
        // Item title
        const itemTitle = document.createElement('h3');
        itemTitle.textContent = item.title;
        
        carouselItem.appendChild(thumbnailContainer);
        carouselItem.appendChild(itemTitle);
        
        // Open modal on item click
        carouselItem.addEventListener('click', () => {
            createModal(item);
        });
        
        carouselItems.appendChild(carouselItem);
    });
    
    carouselWrapper.appendChild(carouselItems);
    carouselContainer.appendChild(carouselWrapper);
    
    // Add scroll hint if there are enough items
    if (items.length > 3) {
        const scrollHint = document.createElement('div');
        scrollHint.className = 'scroll-hint';
        scrollHint.innerHTML = '<span>Scroll for more</span>';
        carouselContainer.appendChild(scrollHint);
    }
    
    // Handle carousel scrolling
    setupCarouselScrolling(carouselWrapper, carouselItems, leftEdge, rightEdge);
    
    return carouselContainer;
}

// Set up carousel scrolling behavior
function setupCarouselScrolling(wrapper, container, leftEdge, rightEdge) {
    // Initial state check
    updateEdgeIndicators();
    
    // Update edge indicators when scrolling
    container.addEventListener('scroll', () => {
        updateEdgeIndicators();
        
        // Hide scroll hint after user has scrolled
        const scrollHint = wrapper.parentElement.querySelector('.scroll-hint');
        if (scrollHint) {
            scrollHint.style.display = 'none';
        }
    });
    
    // Add click handling for the carousel wrapper
    wrapper.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const containerWidth = rect.width;
        
        if (x < containerWidth / 2) {
            // Left side clicked
            container.scrollBy({ left: -300, behavior: 'smooth' });
        } else {
            // Right side clicked
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    });
    
    function updateEdgeIndicators() {
        const isAtStart = container.scrollLeft < 10;
        const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
        
        if (isAtStart) {
            leftEdge.classList.remove('active');
        } else {
            leftEdge.classList.add('active');
        }
        
        if (isAtEnd) {
            rightEdge.classList.remove('active');
        } else {
            rightEdge.classList.add('active');
        }
    }
}

// Create modal for expanded view
function createModal(item) {
    // Remove any existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close');
    
    // Content - either video or image
    if (item.video) {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const iframe = document.createElement('iframe');
        iframe.src = item.video;
        iframe.title = item.title;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowFullscreen', '');
        
        videoContainer.appendChild(iframe);
        modalContent.appendChild(videoContainer);
    } else {
        const image = document.createElement('img');
        image.src = item.fullImage || item.thumbnail;
        image.alt = item.title;
        image.className = 'full-image';
        image.onerror = function() {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E";
        };
        
        modalContent.appendChild(image);
    }
    
    // Item title
    const title = document.createElement('h2');
    title.textContent = item.title;
    
    // Item description
    const description = document.createElement('div');
    description.className = 'item-description';
    description.textContent = item.description;
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    
    modalOverlay.appendChild(modalContent);
    
    // Function to safely close the modal and restore scrolling
    function closeModal() {
        modalOverlay.remove();
        document.body.style.overflow = 'auto'; // Immediately restore scrolling
        document.removeEventListener('keydown', handleEscape);
    }
    
    // Handle close events
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Add to document and prevent body scrolling
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}

// Create Contact section
function createContactSection(contact) {
    const section = document.createElement('section');
    section.id = 'contact';
    section.className = 'section';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Contact';
    section.appendChild(heading);
    
    const container = document.createElement('div');
    container.className = 'contact-container';
    
    // Contact info
    const contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info';
    
    // Email
    if (contact.email) {
        const emailPara = document.createElement('p');
        const emailStrong = document.createElement('strong');
        emailStrong.textContent = 'Email: ';
        
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${contact.email}`;
        emailLink.textContent = contact.email;
        
        emailPara.appendChild(emailStrong);
        emailPara.appendChild(emailLink);
        contactInfo.appendChild(emailPara);
    }
    
    // Phone
    if (contact.phone) {
        const phonePara = document.createElement('p');
        const phoneStrong = document.createElement('strong');
        phoneStrong.textContent = 'Phone: ';
        
        phonePara.appendChild(phoneStrong);
        phonePara.appendChild(document.createTextNode(contact.phone));
        contactInfo.appendChild(phonePara);
    }
    
    // Social media
    if (contact.socialMedia) {
        const socialMedia = document.createElement('div');
        socialMedia.className = 'social-media';
        
        // Instagram
        if (contact.socialMedia.instagram) {
            createSocialLink(socialMedia, contact.socialMedia.instagram, 'instagram', 'Instagram');
        }
        
        // Facebook
        if (contact.socialMedia.facebook) {
            createSocialLink(socialMedia, contact.socialMedia.facebook, 'facebook', 'Facebook');
        }
        
        // YouTube
        if (contact.socialMedia.youtube) {
            createSocialLink(socialMedia, contact.socialMedia.youtube, 'youtube', 'YouTube');
        }
        
        // Vimeo
        if (contact.socialMedia.vimeo) {
            createSocialLink(socialMedia, contact.socialMedia.vimeo, 'vimeo', 'Vimeo');
        }
        
        contactInfo.appendChild(socialMedia);
    }
    
    container.appendChild(contactInfo);
    
    // Contact form
    if (contact.formEnabled) {
        const formContainer = document.createElement('div');
        formContainer.className = 'contact-form-container';
        
        const form = document.createElement('form');
        form.className = 'contact-form';
        // Set up FormSubmit action with secure token instead of email
        form.action = 'https://formsubmit.co/7901188d6d31702f00ad3357f2698284';
        form.method = 'POST';
        
        // Hidden fields for FormSubmit configuration
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = '_honey';
        honeypot.style.display = 'none';
        
        const disableAutoreply = document.createElement('input');
        disableAutoreply.type = 'hidden';
        disableAutoreply.name = '_autoresponse';
        disableAutoreply.value = 'Thank you for your message. I will get back to you soon!';
        
        const redirectTo = document.createElement('input');
        redirectTo.type = 'hidden';
        redirectTo.name = '_next';
        
        // For local development and GitHub Pages compatibility
        // The FormSubmit service requires an absolute URL and cannot redirect to localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // For local testing, use a dummy thank you page that FormSubmit provides
            redirectTo.value = 'https://formsubmit.co/thank-you/';
        } else {
            // For production/GitHub Pages, use the actual site URL
            redirectTo.value = window.location.href + '?submitted=true';
        }
        
        // Name field
        const nameGroup = createFormGroup('name', 'Name', 'text', true);
        
        // Email field
        const emailGroup = createFormGroup('email', 'Email', 'email', true);
        
        // Message field
        const messageGroup = document.createElement('div');
        messageGroup.className = 'form-group';
        
        const messageLabel = document.createElement('label');
        messageLabel.htmlFor = 'message';
        messageLabel.textContent = 'Message';
        
        const messageTextarea = document.createElement('textarea');
        messageTextarea.id = 'message';
        messageTextarea.name = 'message';
        messageTextarea.rows = 5;
        messageTextarea.required = true;
        
        messageGroup.appendChild(messageLabel);
        messageGroup.appendChild(messageTextarea);
        
        // Submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'submit-button';
        submitButton.textContent = 'Send Message';
        
        // Build form with FormSubmit configuration
        form.appendChild(honeypot);
        form.appendChild(disableAutoreply);
        form.appendChild(redirectTo);
        form.appendChild(nameGroup);
        form.appendChild(emailGroup);
        form.appendChild(messageGroup);
        form.appendChild(submitButton);
        
        // Show success message if redirected back after submission
        if (window.location.search.includes('submitted=true')) {
            const formSuccess = document.createElement('div');
            formSuccess.className = 'form-success';
            formSuccess.textContent = 'Message sent! Thank you for your inquiry.';
            form.prepend(formSuccess);
            
            // Clear the URL parameter after showing the message
            setTimeout(() => {
                const newURL = window.location.pathname;
                window.history.replaceState({}, document.title, newURL);
            }, 5000);
        }
        
        // Loading state handler
        form.addEventListener('submit', () => {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
        });
        
        formContainer.appendChild(form);
        container.appendChild(formContainer);
    }
    
    section.appendChild(container);
    document.querySelector('main').appendChild(section);
}

// Helper function to create a form group
function createFormGroup(id, label, type, required = false) {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    
    if (required) {
        input.required = true;
    }
    
    group.appendChild(labelElement);
    group.appendChild(input);
    
    return group;
}

// Helper function to create a social media link
function createSocialLink(container, url, platform, label) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = `social-icon ${platform}`;
    link.setAttribute('aria-label', label);
    
    const span = document.createElement('span');
    span.textContent = label;
    
    link.appendChild(span);
    container.appendChild(link);
}

// Create the footer
function createFooter(config) {
    const footer = document.createElement('footer');
    
    const copyright = document.createElement('p');
    const currentYear = new Date().getFullYear();
    copyright.textContent = `© ${currentYear} ${config.siteTitle}`;
    
    footer.appendChild(copyright);
    document.body.appendChild(footer);
}

// Initialize the intersection observer for active section detection
function initSectionObserver() {
    const sections = document.querySelectorAll('.section');
    
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update active navigation link
                const activeSection = entry.target.id;
                document.querySelectorAll('nav a').forEach(link => {
                    if (link.getAttribute('data-section') === activeSection) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, options);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

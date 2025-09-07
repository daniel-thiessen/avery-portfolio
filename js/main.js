// Main JavaScript file for the Artist Portfolio site

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the site
    initSite(siteConfig);
});

// Format text to handle line breaks and links
function formatText(text) {
    if (!text) return '';
    
    // Convert line breaks to <br> tags
    let formatted = text.replace(/\n/g, '<br>');
    
    // Convert URLs to clickable links
    // This regex matches http/https URLs
    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert email addresses to mailto links
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    formatted = formatted.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    return formatted;
}

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
    
    // CV link
    if (config.cvPdf) {
        const cvLink = document.createElement('a');
        cvLink.href = config.cvPdf;
        cvLink.target = '_blank';
        cvLink.rel = 'noopener noreferrer';
        cvLink.className = 'cv-link';
        cvLink.textContent = 'CV (PDF)';
        // Insert before hamburger for visibility
        headerContent.insertBefore(cvLink, headerContent.querySelector('.hamburger'));
    }
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
    bio.innerHTML = formatText(about.bio);
    
    const longBio = document.createElement('p');
    longBio.className = 'long-bio';
    longBio.innerHTML = formatText(about.longBio);
    
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
    carouselContainer.setAttribute('role','group');
    carouselContainer.setAttribute('aria-roledescription','carousel');
    
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
    carouselItems.setAttribute('role','list');
    // Keep DOM light—no tabindex list semantics needed now
    
    // Add items to carousel
    items.forEach(item => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.dataset.id = item.id;
        carouselItem.setAttribute('role','listitem');
    // Accessibility kept simple—modal provides detail disclosure
        
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

    // Navigation buttons (desktop enhancement)
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Scroll left');
    prevBtn.innerHTML = '<span aria-hidden="true">←</span>';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Scroll right');
    nextBtn.innerHTML = '<span aria-hidden="true">→</span>';

    function scrollByAmount(dir){
        const amount = Math.round(carouselItems.clientWidth * 0.8) * dir;
        carouselItems.scrollBy({ left: amount, behavior: 'smooth' });
    }
    prevBtn.addEventListener('click', ()=>scrollByAmount(-1));
    nextBtn.addEventListener('click', ()=>scrollByAmount(1));
    prevBtn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); scrollByAmount(-1);} });
    nextBtn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); scrollByAmount(1);} });

    carouselContainer.appendChild(prevBtn);
    carouselContainer.appendChild(nextBtn);
    
    // Subtle affordance hint ("→ more") only if overflow expected
    if (items.length > 3) {
        const hint = document.createElement('div');
        hint.className = 'scroll-hint subtle-hint';
        hint.textContent = '→';
        carouselContainer.appendChild(hint);
    }
    
    // Handle carousel scrolling
    setupCarouselScrolling(carouselWrapper, carouselItems, leftEdge, rightEdge);
    // Update button disabled state
    function updateButtons(){
        const atStart = carouselItems.scrollLeft < 10;
        const atEnd = carouselItems.scrollLeft + carouselItems.clientWidth >= carouselItems.scrollWidth - 10;
        prevBtn.disabled = atStart;
        nextBtn.disabled = atEnd;
    }
    carouselItems.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    requestAnimationFrame(updateButtons);
    
    return carouselContainer;
}

// Set up carousel scrolling behavior
function setupCarouselScrolling(wrapper, container, leftEdge, rightEdge) {
    updateEdgeIndicators();
    
    // Update edge indicators when scrolling
    container.addEventListener('scroll', () => {
        updateEdgeIndicators();
        const hint = wrapper.parentElement.querySelector('.subtle-hint');
        if (hint && container.scrollLeft > 30) {
            hint.style.opacity = '0';
            hint.style.transition = 'opacity 0.4s ease';
            setTimeout(()=>hint.remove(),500);
        }
    });

    // Click-to-pan (original behavior retained)
    wrapper.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const containerWidth = rect.width;
        if (x < containerWidth / 2) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    });

    // Pointer drag (natural desktop feel)
    let isDown = false; let startX = 0; let scrollStart = 0;
    container.addEventListener('pointerdown', (e) => {
        isDown = true; startX = e.clientX; scrollStart = container.scrollLeft; container.style.scrollBehavior='auto'; container.classList.add('dragging');
    });
    window.addEventListener('pointerup', () => { if(isDown){ isDown=false; container.classList.remove('dragging'); container.style.scrollBehavior='smooth'; }});
    window.addEventListener('pointermove', (e) => { if(!isDown) return; const dx = e.clientX - startX; container.scrollLeft = scrollStart - dx; });

    // Wheel to horizontal scroll (desktop usability)
    container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // user already scrolling horizontally
        const atStart = container.scrollLeft < 5;
        const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
        if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) {
            return; // allow page scroll when at edges
        }
        // Prevent vertical page scroll while actively translating
        e.preventDefault();
        container.scrollBy({ left: e.deltaY * 0.9, behavior: 'auto' });
    }, { passive: false });

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
    description.innerHTML = formatText(item.description);
    
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
    
    // Social media (restricted to Instagram & Facebook per request)
    if (contact.socialMedia) {
        const socialMedia = document.createElement('div');
        socialMedia.className = 'social-media';
        const allowed = ['instagram','facebook'];
        allowed.forEach(platform => {
            const url = contact.socialMedia[platform];
            if (url) {
                const label = platform.charAt(0).toUpperCase() + platform.slice(1);
                createSocialLink(socialMedia, url, platform, label);
            }
        });
        if (socialMedia.childNodes.length) {
            contactInfo.appendChild(socialMedia);
        }
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
    // Inline SVG/IMG fallback strategy for reliability (some browsers blocked pseudo-element icons)
    if (['instagram','facebook'].includes(platform)) {
        const iconVariants = [
            `assets/icons/${platform}-outline.svg`,
            `assets/icons/${platform}.svg`
        ];
        let variantIndex = 0;
        const img = document.createElement('img');
        img.className = 'icon-img';
        img.alt = '';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.src = iconVariants[variantIndex];
        img.onerror = function() {
            variantIndex++;
            if (variantIndex < iconVariants.length) {
                // Cache-bust attempt for fallback load
                this.src = iconVariants[variantIndex] + '?v=' + Date.now();
            } else {
                this.remove();
                link.classList.add('icon-fallback-text');
                const fallbackInitial = document.createElement('span');
                fallbackInitial.className = 'icon-fallback-initial';
                fallbackInitial.textContent = label.charAt(0); // First letter as final fallback
                link.appendChild(fallbackInitial);
            }
        };
        link.classList.add('has-inline-icon');
        link.appendChild(img);
    }

    // Visually hidden accessible label
    const span = document.createElement('span');
    span.className = 'visually-hidden';
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

// Configuration file for site content
// This file is designed to be easily edited by non-technical users

const siteConfig = {
    // Site information
    siteTitle: "Avery Smith",
    siteDescription: "Showcase of artistic work and performances",
    
    // About section
    about: {
        name: "Avery Smith",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.",
        longBio: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin vel ante a orci tempus eleifend ut et magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta. Sed nec diam eu diam mattis viverra."
    },
    
    // Current section - current projects, exhibitions or focus
    current: {
        title: "Current Work",
        items: [
            {
                id: "current1",
                title: "Project Name 1",
                thumbnail: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "", // Leave empty if no video
                description: "Description of current project 1"
            },
            {
                id: "current2",
                title: "Project Name 2",
                thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of current project 2"
            },
            {
                id: "current3",
                title: "Project Name 3",
                thumbnail: "https://images.unsplash.com/photo-1495791185843-c73f2269f669?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1495791185843-c73f2269f669?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "",
                description: "Description of current project 3"
            }
        ]
    },
    
    // Choreography section
    choreography: {
        title: "Choreography",
        items: [
            {
                id: "choreo1",
                title: "Choreography Piece 1",
                thumbnail: "https://images.unsplash.com/photo-1536063211352-0b94219f6212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1536063211352-0b94219f6212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of choreography piece 1"
            },
            {
                id: "choreo2",
                title: "Choreography Piece 2",
                thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
                fullImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
                video: "",
                description: "Description of choreography piece 2"
            },
            {
                id: "choreo3",
                title: "Choreography Piece 3",
                thumbnail: "https://images.unsplash.com/photo-1551989745-347c28b620e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                fullImage: "https://images.unsplash.com/photo-1551989745-347c28b620e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of choreography piece 3"
            }
        ]
    },
    
    // Projects section
    projects: {
        title: "Projects",
        items: [
            {
                id: "project1",
                title: "Project Title 1",
                thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                fullImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                video: "",
                description: "Description of project 1"
            },
            {
                id: "project2",
                title: "Project Title 2",
                thumbnail: "https://images.unsplash.com/photo-1511715282680-fbf93a50e721?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1511715282680-fbf93a50e721?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of project 2"
            },
            {
                id: "project3",
                title: "Project Title 3",
                thumbnail: "https://images.unsplash.com/photo-1594125674956-61a9b49c8ecc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                fullImage: "https://images.unsplash.com/photo-1594125674956-61a9b49c8ecc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                video: "",
                description: "Description of project 3"
            }
        ]
    },
    
    // Performances section
    performances: {
        title: "Performances",
        items: [
            {
                id: "perf1",
                title: "Performance 1",
                thumbnail: "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1489&q=80",
                fullImage: "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1489&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of performance 1"
            },
            {
                id: "perf2",
                title: "Performance 2",
                thumbnail: "https://images.unsplash.com/photo-1523780981236-15187fc5b04f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
                fullImage: "https://images.unsplash.com/photo-1523780981236-15187fc5b04f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
                video: "",
                description: "Description of performance 2"
            },
            {
                id: "perf3",
                title: "Performance 3",
                thumbnail: "https://images.unsplash.com/photo-1557264305-7e2764da873b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                fullImage: "https://images.unsplash.com/photo-1557264305-7e2764da873b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                description: "Description of performance 3"
            }
        ]
    },
    
    // Contact section
    contact: {
        email: "thiessen.dan@gmail.com",
        phone: "+1 (123) 456-7890",
        socialMedia: {
            instagram: "https://instagram.com/yourusername",
            facebook: "https://facebook.com/yourpage",
            youtube: "https://youtube.com/yourchannel",
            vimeo: "https://vimeo.com/youraccount"
        },
        formEnabled: true // Set to false to disable the contact form
    },
    
    // Navigation menu
    navigation: [
        { id: "about", label: "About" },
        { id: "current", label: "Current" },
        { id: "choreography", label: "Choreography" },
        { id: "projects", label: "Projects" },
        { id: "performances", label: "Performances" },
        { id: "contact", label: "Contact" }
    ]
};

// Make available globally
window.siteConfig = siteConfig;

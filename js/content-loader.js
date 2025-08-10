// Content loader for Netlify CMS managed content
// This replaces the config.js functionality

class ContentLoader {
    constructor() {
        this.cache = {};
    }

    // Simple YAML parser for basic key-value pairs
    parseSimpleYaml(yamlText) {
        const lines = yamlText.trim().split('\n');
        const result = {};
        let currentKey = null;
        let nestedObject = {};
        let inNestedObject = false;

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line.includes(': ') && !line.startsWith(' ') && !line.startsWith('-')) {
                // Save previous nested object if exists
                if (inNestedObject && currentKey) {
                    result[currentKey] = nestedObject;
                    nestedObject = {};
                    inNestedObject = false;
                }

                const colonIndex = line.indexOf(': ');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 2).trim();
                
                if (value.startsWith('"') && value.endsWith('"')) {
                    result[key] = value.slice(1, -1);
                } else if (value === 'true') {
                    result[key] = true;
                } else if (value === 'false') {
                    result[key] = false;
                } else if (value === '' || value === '{}') {
                    // This might be a nested object
                    currentKey = key;
                    inNestedObject = true;
                } else if (!isNaN(value) && value !== '') {
                    result[key] = parseInt(value, 10);
                } else {
                    result[key] = value;
                }
            } else if (inNestedObject && line.includes(': ')) {
                // Handle nested properties
                const colonIndex = line.indexOf(': ');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 2).trim();
                const cleanKey = key.replace(/^[\s-]+/, '');
                
                if (value.startsWith('"') && value.endsWith('"')) {
                    nestedObject[cleanKey] = value.slice(1, -1);
                } else if (value === 'true') {
                    nestedObject[cleanKey] = true;
                } else if (value === 'false') {
                    nestedObject[cleanKey] = false;
                } else if (!isNaN(value) && value !== '') {
                    nestedObject[cleanKey] = parseInt(value, 10);
                } else {
                    nestedObject[cleanKey] = value;
                }
            }
        }

        // Save final nested object if exists
        if (inNestedObject && currentKey) {
            result[currentKey] = nestedObject;
        }

        return result;
    }

    // Parse frontmatter from markdown
    parseFrontmatter(markdownText) {
        const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/;
        const match = markdownText.match(frontmatterRegex);
        
        if (match) {
            const frontmatter = this.parseSimpleYaml(match[1]);
            const content = match[2] ? match[2].trim() : '';
            return { ...frontmatter, content };
        }
        
        // Debug: log the text that failed to parse
        console.warn('Failed to parse frontmatter from:', markdownText.substring(0, 200));
        return null;
    }

    // Load YAML file
    async loadYaml(path) {
        if (this.cache[path]) {
            return this.cache[path];
        }

        try {
            console.log(`Loading YAML file: ${path}`);
            const response = await fetch(path);
            console.log(`YAML response status: ${response.status} for ${path}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            
            const yamlText = await response.text();
            console.log(`YAML content received (${yamlText.length} chars) for ${path}`);
            
            const data = this.parseSimpleYaml(yamlText);
            this.cache[path] = data;
            console.log(`YAML parsed successfully:`, data);
            return data;
        } catch (error) {
            console.warn(`Could not load ${path}, using fallback data:`, error);
            return null;
        }
    }

    // Load markdown file with frontmatter
    async loadMarkdown(path) {
        if (this.cache[path]) {
            return this.cache[path];
        }

        try {
            console.log(`Loading markdown file: ${path}`);
            const response = await fetch(path);
            console.log(`Markdown response status: ${response.status} for ${path}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            
            const markdownText = await response.text();
            console.log(`Markdown content received (${markdownText.length} chars) for ${path}`);
            
            const data = this.parseFrontmatter(markdownText);
            
            if (data) {
                this.cache[path] = data;
                console.log(`Markdown parsed successfully:`, data);
                return data;
            } else {
                throw new Error('No frontmatter found');
            }
        } catch (error) {
            console.warn(`Could not load ${path}:`, error);
            return null;
        }
    }

    // Load all files from a directory (simulated by trying specific filenames for each directory)
    async loadDirectory(directory) {
        const items = [];
        let filesToTry = [];

        console.log(`Loading content from directory: ${directory}`);

        // Define specific files for each directory
        switch (directory) {
            case '_content/current':
                filesToTry = ['here-we-are.md'];
                break;
            case '_content/choreography':
                filesToTry = ['choreography-piece-1.md', 'choreography-piece-2.md', 'choreography-piece-3.md'];
                break;
            case '_content/projects':
                filesToTry = ['project-1.md', 'project-2.md', 'project-3.md'];
                break;
            case '_content/performances':
                filesToTry = ['performance-1.md', 'performance-2.md', 'performance-3.md'];
                break;
            default:
                filesToTry = [];
        }
        
        console.log(`Files to try in ${directory}:`, filesToTry);

        for (const filename of filesToTry) {
            const fullPath = `${directory}/${filename}`;
            const item = await this.loadMarkdown(fullPath);
            if (item) {
                items.push(item);
            }
        }

        // Sort by order field if it exists
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        return items;
    }

    // Get the site configuration in the format expected by the existing code
    async getSiteConfig() {
        try {
            // Load all data
            const [settings, about, contact, currentItems, choreographyItems, projectItems, performanceItems] = await Promise.all([
                this.loadYaml('_data/settings.yml'),
                this.loadYaml('_data/about.yml'),
                this.loadYaml('_data/contact.yml'),
                this.loadDirectory('_content/current'),
                this.loadDirectory('_content/choreography'),
                this.loadDirectory('_content/projects'),
                this.loadDirectory('_content/performances')
            ]);

            console.log('Loaded CMS content:', { settings, about, contact, currentItems, choreographyItems, projectItems, performanceItems });

            // Create config object in the format expected by the existing main.js
            const config = {
                siteTitle: settings?.site_title || "Avery Smith",
                siteDescription: settings?.site_description || "Showcase of artistic work and performances",
                
                about: {
                    name: about?.name || "Avery Smith",
                    profileImage: about?.profile_image || "images/avery-portrait.png",
                    bio: about?.bio || "",
                    longBio: about?.long_bio || ""
                },
                
                current: {
                    title: "Current Work",
                    items: currentItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail,
                        fullImage: item.full_image || item.thumbnail,
                        video: item.video || "",
                        description: item.description
                    }))
                },
                
                choreography: {
                    title: "Choreography",
                    items: choreographyItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail,
                        fullImage: item.full_image || item.thumbnail,
                        video: item.video || "",
                        description: item.description
                    }))
                },
                
                projects: {
                    title: "Projects",
                    items: projectItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail,
                        fullImage: item.full_image || item.thumbnail,
                        video: item.video || "",
                        description: item.description
                    }))
                },
                
                performances: {
                    title: "Performances",
                    items: performanceItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail,
                        fullImage: item.full_image || item.thumbnail,
                        video: item.video || "",
                        description: item.description
                    }))
                },
                
                contact: {
                    email: contact?.email || "",
                    phone: contact?.phone || "",
                    socialMedia: {
                        instagram: contact?.social_media?.instagram || "",
                        facebook: contact?.social_media?.facebook || "",
                        youtube: contact?.social_media?.youtube || "",
                        vimeo: contact?.social_media?.vimeo || ""
                    },
                    formEnabled: contact?.form_enabled !== false
                },
                
                navigation: [
                    { id: "about", label: "About" },
                    { id: "current", label: "Current" },
                    { id: "choreography", label: "Choreography" },
                    { id: "projects", label: "Projects" },
                    { id: "performances", label: "Performances" },
                    { id: "contact", label: "Contact" }
                ]
            };

            console.log('Generated config:', config);
            return config;

        } catch (error) {
            console.error('Error loading CMS content, falling back to config.js:', error);
            // Fallback to original config if CMS content fails to load
            return this.getFallbackConfig();
        }
    }

    // Generate ID from title
    generateId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // Fallback configuration if CMS content fails to load
    getFallbackConfig() {
        // Return the original config from config.js if available
        if (window.siteConfig) {
            return window.siteConfig;
        }

        // Minimal fallback
        return {
            siteTitle: "Avery Smith",
            siteDescription: "Showcase of artistic work and performances",
            about: {
                name: "Avery Smith",
                profileImage: "images/avery-portrait.png",
                bio: "Content loading...",
                longBio: "Content loading..."
            },
            current: { title: "Current Work", items: [] },
            choreography: { title: "Choreography", items: [] },
            projects: { title: "Projects", items: [] },
            performances: { title: "Performances", items: [] },
            contact: {
                email: "averymileahsmith@gmail.com",
                phone: "",
                socialMedia: {},
                formEnabled: true
            },
            navigation: [
                { id: "about", label: "About" },
                { id: "current", label: "Current" },
                { id: "choreography", label: "Choreography" },
                { id: "projects", label: "Projects" },
                { id: "performances", label: "Performances" },
                { id: "contact", label: "Contact" }
            ]
        };
    }
}

// Create global content loader instance
window.contentLoader = new ContentLoader();

// Debug function to check if content files are available
(async function debugContentFiles() {
    try {
        // Test YAML files
        console.log("Checking if content files are accessible...");
        const settingsTest = await fetch('_data/settings.yml');
        console.log(`Settings YAML status: ${settingsTest.status}`);
        
        // Test Markdown files
        const currentTest = await fetch('_content/current/here-we-are.md');
        console.log(`Current MD status: ${currentTest.status}`);
        
        // Check the base path
        console.log("Base path:", window.location.pathname);
    } catch (error) {
        console.error("Error checking content files:", error);
    }
})();
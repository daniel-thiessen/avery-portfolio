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

    // Load YAML file with robust error handling and cache busting
    async loadYaml(path) {
        try {
            console.log(`Loading YAML file: ${path}`);
            
            // Force no-cache to ensure fresh content
            const response = await fetch(path, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log(`YAML response status: ${response.status} for ${path}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            
            const yamlText = await response.text();
            console.log(`YAML content received (${yamlText.length} chars) for ${path}`);
            
            if (!yamlText || yamlText.trim().length === 0) {
                console.warn(`Empty YAML content received for ${path}`);
                return null;
            }
            
            const data = this.parseSimpleYaml(yamlText);
            if (!data || Object.keys(data).length === 0) {
                console.warn(`YAML parsing produced no data for ${path}`);
                return null;
            }
            
            this.cache[path] = data;
            console.log(`YAML parsed successfully:`, data);
            return data;
        } catch (error) {
            console.warn(`Could not load YAML ${path}:`, error);
            return null;
        }
    }

    // Load markdown file with frontmatter and robust error handling
    async loadMarkdown(path) {
        try {
            console.log(`Loading markdown file: ${path}`);
            
            // Force no-cache to ensure fresh content
            const response = await fetch(path, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log(`Markdown response status: ${response.status} for ${path}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            
            const markdownText = await response.text();
            console.log(`Markdown content received (${markdownText.length} chars) for ${path}`);
            
            if (!markdownText || markdownText.trim().length === 0) {
                console.warn(`Empty markdown content received for ${path}`);
                return null;
            }
            
            const data = this.parseFrontmatter(markdownText);
            
            if (data) {
                // Store in cache with path as key
                this.cache[path] = data;
                console.log(`Markdown parsed successfully for ${path.split('/').pop()}:`, data);
                return data;
            } else {
                console.warn(`No valid frontmatter found in ${path}`);
                
                // Try to create a minimal valid object from the markdown content
                const filename = path.split('/').pop().replace(/\.md$/, '');
                const fallbackData = {
                    title: filename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    content: markdownText
                };
                
                console.log(`Created fallback data for ${filename}:`, fallbackData);
                this.cache[path] = fallbackData;
                return fallbackData;
            }
        } catch (error) {
            console.warn(`Could not load markdown ${path}:`, error);
            return null;
        }
    }

    // Load all files from a directory using GitHub API
    async loadDirectory(directory, timestamp = Date.now()) {
        const items = [];
        let directoryPath = '';
        let categoryName = '';

        console.log(`Loading content from directory: ${directory}`);
        
        // Extract the directory category name for fallback detection
        if (directory.includes('_content/')) {
            categoryName = directory.split('_content/')[1].split('/')[0];
            console.log(`Category name: ${categoryName}`);
        }

        // First try to load all files using GitHub API
        const apiItems = await this.fetchDirectoryContentsViaGitHubAPI(directory, timestamp);
        if (apiItems && apiItems.length > 0) {
            console.log(`Successfully loaded ${apiItems.length} files from GitHub API for ${directory}`);
            items.push(...apiItems);
        } else {
            console.warn(`GitHub API directory listing failed for ${directory}, trying fallback files...`);
            
            // Fallback to predefined files if API fails
            let filesToTry = [];
            
            switch (categoryName) {
                case 'current':
                    filesToTry = ['here-we-are.md'];
                    break;
                case 'choreography':
                    filesToTry = ['choreography-piece-1.md', 'choreography-piece-2.md', 'choreography-piece-3.md'];
                    break;
                case 'projects':
                    filesToTry = ['project-1.md', 'project-2.md', 'project-3.md'];
                    break;
                case 'performances':
                    filesToTry = ['performance-1.md', 'performance-2.md', 'performance-3.md'];
                    break;
                default:
                    console.warn(`Unknown directory category: ${categoryName}`);
                    filesToTry = [];
            }
            
            console.log(`Trying fallback files in ${directory}:`, filesToTry);

            // Try each known file
            for (const filename of filesToTry) {
                const fullPath = `${directory}/${filename}?t=${timestamp}`;
                const item = await this.loadMarkdown(fullPath);
                if (item) {
                    items.push(item);
                }
            }
        }

        // Sort by order field if it exists
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        return items;
    }
    
    // Fetch directory contents using GitHub API
    async fetchDirectoryContentsViaGitHubAPI(directory, timestamp) {
        try {
            // Extract the path from raw.githubusercontent.com URL
            const pathMatch = directory.match(/github\.com\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)/);
            if (!pathMatch) {
                console.warn(`Could not extract path from URL: ${directory}`);
                return [];
            }
            
            const path = pathMatch[1];
            const repo = 'daniel-thiessen/avery-portfolio';
            const branch = 'main';
            
            // Use GitHub API to list directory contents
            const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}&timestamp=${timestamp}`;
            console.log(`Fetching directory contents via GitHub API: ${apiUrl}`);
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                },
                cache: 'no-store' // Ensure we're not using cached API responses
            });
            
            if (!response.ok) {
                console.warn(`GitHub API request failed: ${apiUrl} (Status: ${response.status})`);
                return [];
            }
            
            const contents = await response.json();
            
            if (!Array.isArray(contents)) {
                console.warn(`GitHub API returned unexpected format (not an array):`, contents);
                return [];
            }
            
            console.log(`Found ${contents.length} items in directory ${path}`);
            
            // Process only markdown files in the directory
            const items = [];
            const markdownFiles = contents.filter(item => item.type === 'file' && item.name.endsWith('.md'));
            
            console.log(`Found ${markdownFiles.length} markdown files in ${path}`);
            
            // Load all markdown files in parallel for better performance
            const loadPromises = markdownFiles.map(async file => {
                // Use direct raw content URL for the file
                const rawUrl = file.download_url + `?t=${timestamp}`;
                console.log(`Loading markdown file: ${file.name} from ${rawUrl}`);
                
                const fileContent = await this.loadMarkdown(rawUrl);
                if (fileContent) {
                    items.push(fileContent);
                }
            });
            
            await Promise.all(loadPromises);
            return items;
            
        } catch (error) {
            console.warn(`Error fetching directory contents via GitHub API:`, error);
            return [];
        }
    }

    // Get the site configuration in the format expected by the existing code
    async getSiteConfig() {
        try {
            // Clear cache every time to ensure fresh content
            this.cache = {};
            
            // Use raw GitHub content URLs for content files with cache-busting timestamp
            const timestamp = Date.now();
            const contentBaseUrl = `https://raw.githubusercontent.com/daniel-thiessen/avery-portfolio/main`;
            
            console.log(`Loading content with cache-busting timestamp: ${timestamp}`);
            
            // Load all data
            const [settings, about, contact, currentItems, choreographyItems, projectItems, performanceItems] = await Promise.all([
                this.loadYaml(`${contentBaseUrl}/_data/settings.yml?t=${timestamp}`),
                this.loadYaml(`${contentBaseUrl}/_data/about.yml?t=${timestamp}`),
                this.loadYaml(`${contentBaseUrl}/_data/contact.yml?t=${timestamp}`),
                this.loadDirectory(`${contentBaseUrl}/_content/current`, timestamp),
                this.loadDirectory(`${contentBaseUrl}/_content/choreography`, timestamp),
                this.loadDirectory(`${contentBaseUrl}/_content/projects`, timestamp),
                this.loadDirectory(`${contentBaseUrl}/_content/performances`, timestamp)
            ]);

            // Log the content we've loaded
            console.log('Settings:', settings);
            console.log('About:', about);
            console.log('Contact:', contact);
            console.log('Current items:', currentItems.length, currentItems);
            console.log('Choreography items:', choreographyItems.length, choreographyItems);
            console.log('Project items:', projectItems.length, projectItems);
            console.log('Performance items:', performanceItems.length, performanceItems);

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
                        thumbnail: item.thumbnail || "",
                        fullImage: item.full_image || item.thumbnail || "",
                        video: item.video || "",
                        description: item.content || item.description || ""
                    }))
                },
                
                choreography: {
                    title: "Choreography",
                    items: choreographyItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail || "",
                        fullImage: item.full_image || item.thumbnail || "",
                        video: item.video || "",
                        description: item.content || item.description || ""
                    }))
                },
                
                projects: {
                    title: "Projects",
                    items: projectItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail || "",
                        fullImage: item.full_image || item.thumbnail || "",
                        video: item.video || "",
                        description: item.content || item.description || ""
                    }))
                },
                
                performances: {
                    title: "Performances",
                    items: performanceItems.map(item => ({
                        id: this.generateId(item.title),
                        title: item.title,
                        thumbnail: item.thumbnail || "",
                        fullImage: item.full_image || item.thumbnail || "",
                        video: item.video || "",
                        description: item.content || item.description || ""
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

// Function to load content from local files when running locally
async function loadLocalContent() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("Running locally - showing local content sync options");
        
        // Create a sync control panel to be shown on the page
        const syncPanel = document.createElement('div');
        syncPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            font-family: system-ui, sans-serif;
            font-size: 14px;
        `;
        
        syncPanel.innerHTML = `
            <div style="font-weight:bold; margin-bottom:8px;">Content Management</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button id="pull-content" style="padding:5px 10px; background:#f0f0f0; border:1px solid #ccc; border-radius:4px; cursor:pointer;">Pull Content</button>
                <button id="push-content" style="padding:5px 10px; background:#4CAF50; color:white; border:1px solid #388E3C; border-radius:4px; cursor:pointer;">Push to GitHub</button>
                <button id="open-cms" style="padding:5px 10px; background:#2196F3; color:white; border:1px solid #1976D2; border-radius:4px; cursor:pointer;">Open CMS</button>
            </div>
        `;
        
        // Add panel to the document body when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(syncPanel);
            
            // Add event listeners to the buttons
            document.getElementById('pull-content').addEventListener('click', () => {
                fetch('/api/pull-content')
                    .then(response => response.text())
                    .then(text => {
                        alert('Content pulled from GitHub. Reloading page.');
                        window.location.reload();
                    })
                    .catch(err => {
                        alert('Error pulling content: ' + err.message);
                    });
            });
            
            document.getElementById('push-content').addEventListener('click', () => {
                fetch('/api/push-content')
                    .then(response => response.text())
                    .then(text => {
                        alert('Content pushed to GitHub successfully.');
                    })
                    .catch(err => {
                        alert('Error pushing content: ' + err.message);
                    });
            });
            
            document.getElementById('open-cms').addEventListener('click', () => {
                window.open('/admin/', '_blank');
            });
        });
    }
}

// Initialize local content management
loadLocalContent();

// Debug function to check if content files are available
(async function debugContentFiles() {
    try {
        console.log("========== CONTENT LOADER DIAGNOSTIC ==========");
        console.log("Checking if content files are accessible...");
        console.log("Environment:", window.location.hostname);
        console.log("Pathname:", window.location.pathname);
        console.log("Timestamp:", new Date().toISOString());
        
        const contentBaseUrl = "https://raw.githubusercontent.com/daniel-thiessen/avery-portfolio/main";
        const apiBaseUrl = "https://api.github.com/repos/daniel-thiessen/avery-portfolio";
        const cacheBuster = Date.now();
        
        // Check GitHub repo API access (repo listing)
        try {
            const repoTest = await fetch(`${apiBaseUrl}?t=${cacheBuster}`, {
                headers: {'Accept': 'application/vnd.github.v3+json'},
                cache: 'no-store'
            });
            console.log(`GitHub repo API access: ${repoTest.status}`);
            
            if (repoTest.ok) {
                const repoData = await repoTest.json();
                console.log(`Repository: ${repoData.full_name}, default branch: ${repoData.default_branch}`);
            }
        } catch (e) {
            console.warn("GitHub repo API access failed:", e);
        }
        
        // Test YAML files using GitHub raw content URLs
        const settingsTest = await fetch(`${contentBaseUrl}/_data/settings.yml?t=${cacheBuster}`, {cache: 'no-store'});
        console.log(`Settings YAML status: ${settingsTest.status}`);
        
        const aboutTest = await fetch(`${contentBaseUrl}/_data/about.yml?t=${cacheBuster}`, {cache: 'no-store'});
        console.log(`About YAML status: ${aboutTest.status}`);
        
        const contactTest = await fetch(`${contentBaseUrl}/_data/contact.yml?t=${cacheBuster}`, {cache: 'no-store'});
        console.log(`Contact YAML status: ${contactTest.status}`);
        
        // Test Markdown files
        const currentTest = await fetch(`${contentBaseUrl}/_content/current/here-we-are.md?t=${cacheBuster}`, {cache: 'no-store'});
        console.log(`Current MD status: ${currentTest.status}`);
        
        // Check directory listings using GitHub API
        const directories = ['_content/current', '_content/choreography', '_content/projects', '_content/performances'];
        
        for (const dir of directories) {
            try {
                const apiTest = await fetch(`${apiBaseUrl}/contents/${dir}?ref=main&t=${cacheBuster}`, {
                    headers: {'Accept': 'application/vnd.github.v3+json'},
                    cache: 'no-store'
                });
                
                if (apiTest.ok) {
                    const apiData = await apiTest.json();
                    const mdFiles = apiData.filter(item => item.name.endsWith('.md'));
                    console.log(`Directory "${dir}": ${apiTest.status}, found ${mdFiles.length}/${apiData.length} markdown files`);
                    
                    // List first few files
                    if (mdFiles.length > 0) {
                        const fileList = mdFiles.slice(0, 3).map(f => f.name).join(', ');
                        console.log(`  Files (sample): ${fileList}${mdFiles.length > 3 ? ', ...' : ''}`);
                    }
                } else {
                    console.warn(`Directory "${dir}" listing failed: ${apiTest.status}`);
                }
            } catch (e) {
                console.warn(`GitHub API directory listing failed for "${dir}":`, e);
            }
        }
        
        console.log("===============================================");
    } catch (error) {
        console.error("Error checking content files:", error);
    }
})();
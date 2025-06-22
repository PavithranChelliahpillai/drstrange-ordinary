// Dr. Ordinary Content Script
// Rewritten from scratch for simplicity and stability.

class DrugDetector {
  constructor() {
    // The script can be injected at any time. We need to handle all cases.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.run());
    } else {
      this.run();
    }
  }

  async run() {
    console.log('[Dr. Ordinary] Initializing...');
    
    // Check if the extension is enabled before running
    const isEnabled = await this.isEnabled();
    if (!isEnabled) {
      console.log('[Dr. Ordinary] Extension is disabled. Halting execution.');
      return;
    }
    
    // Inject styles programmatically to ensure they're applied
    this.injectStyles();
    
    try {
      // 1. Get the list of drugs from the background script.
      const drugs = await this.fetchDrugsFromBackground();

      if (drugs && drugs.length > 0) {
        // 2. If we have drugs, highlight them on the page.
        console.log(`[Dr. Ordinary] Found ${drugs.length} drugs. Highlighting...`);
        this.highlightWords(drugs);
      } else {
        console.log('[Dr. Ordinary] No drugs to highlight.');
      }
    } catch (error) {
      console.error('[Dr. Ordinary] Main process failed:', error);
    }
  }

  async isEnabled() {
    return new Promise((resolve) => {
      // Default to true if the value is not set.
      chrome.storage.local.get({ extensionEnabled: true }, (data) => {
        resolve(data.extensionEnabled);
      });
    });
  }

  injectStyles() {
    // Inject styles programmatically to ensure they override page styles
    const style = document.createElement('style');
    style.textContent = `
      .dr-ordinary-highlight {
        background-color: #fffbe6 !important;
        border: 1px solid #ffe58f !important;
        border-radius: 3px !important;
        padding: 0 2px !important;
        font-weight: 600 !important;
        cursor: help !important;
        font-family: inherit !important;
        color: inherit !important;
        display: inline !important;
      }
      
      .dr-ordinary-highlight:hover {
        background-color: #ffeaa7 !important;
        border-color: #fdcb6e !important;
        transform: scale(1.02) !important;
      }

      .dr-ordinary-side-menu {
        position: fixed !important;
        top: 0 !important;
        right: -350px !important; /* Start off-screen */
        width: 320px !important;
        height: 100% !important;
        background-color: #ffffff !important;
        border-left: 1px solid #e0e0e0 !important;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1) !important;
        z-index: 2147483647 !important; /* Max z-index */
        transition: right 0.3s ease-in-out !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        color: #333 !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .dr-ordinary-side-menu.visible {
        right: 0 !important;
      }

      .dr-ordinary-side-menu-header {
        padding: 15px !important;
        border-bottom: 1px solid #eee !important;
      }
      
      .dr-ordinary-side-menu-header h3 {
        margin: 0 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        text-transform: capitalize;
      }

      .dr-ordinary-side-menu-content {
        padding: 15px !important;
        overflow-y: auto !important;
        flex-grow: 1 !important;
      }

      .dr-ordinary-interaction-item {
        margin-bottom: 15px !important;
        padding: 10px !important;
        border-radius: 4px !important;
        border: 1px solid #eee !important;
      }
      
      .dr-ordinary-interaction-item.severity-high { border-left: 4px solid #d9534f !important; }
      .dr-ordinary-interaction-item.severity-medium { border-left: 4px solid #f0ad4e !important; }
      .dr-ordinary-interaction-item.severity-low { border-left: 4px solid #5bc0de !important; }

      .dr-ordinary-interaction-title {
        font-weight: bold !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 5px !important;
      }

      .dr-ordinary-interaction-severity {
        font-size: 12px !important;
        padding: 2px 6px !important;
        border-radius: 10px !important;
        color: white !important;
        text-transform: uppercase !important;
      }

      .dr-ordinary-interaction-severity.high { background-color: #d9534f !important; }
      .dr-ordinary-interaction-severity.medium { background-color: #f0ad4e !important; }
      .dr-ordinary-interaction-severity.low { background-color: #5bc0de !important; }

      .dr-ordinary-interaction-description {
        font-size: 14px !important;
        line-height: 1.4 !important;
      }
    `;
    document.head.appendChild(style);
    console.log('[Dr. Ordinary] Styles injected programmatically');
    
    // Debug: Check if styles are actually applied
    setTimeout(() => {
      const testSpan = document.createElement('span');
      testSpan.className = 'dr-ordinary-highlight';
      testSpan.textContent = 'TEST';
      testSpan.style.position = 'absolute';
      testSpan.style.top = '-1000px';
      testSpan.style.left = '-1000px';
      document.body.appendChild(testSpan);
      
      const computedStyle = window.getComputedStyle(testSpan);
      console.log('[Dr. Ordinary] Test span background color:', computedStyle.backgroundColor);
      console.log('[Dr. Ordinary] Test span border:', computedStyle.border);
      
      document.body.removeChild(testSpan);
    }, 100);
  }

  async fetchDrugsFromBackground() {
    // Pre-flight checks before sending the message.
    if (!chrome.runtime?.id) {
      console.warn('[Dr. Ordinary] Extension context is not available. Aborting.');
      return null;
    }
    const url = window.location.href;
    if (url.includes('google.com/search') || url.includes('chrome://')) {
      console.log('[Dr. Ordinary] Skipping analysis on this page.');
      return null;
    }

    try {
      console.log('[Dr. Ordinary] Getting page content and sending to background...');
      const pageContent = this.extractPageText();
      
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWithLetta',
        content: pageContent,
        url: url
      });

      if (chrome.runtime.lastError) {
        throw new Error(`Runtime Error: ${chrome.runtime.lastError.message}`);
      }

      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Background script returned a failure.');
      }
    } catch (error) {
      console.error('[Dr. Ordinary] Could not fetch drugs from background:', error);
      return null; // Return null to prevent further processing on failure.
    }
  }

  extractPageText() {
    // A simple and safe way to get representative text from the page.
    return document.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 15000);
  }

  highlightWords(words) {
    console.log('[Dr. Ordinary] Starting highlightWords with drugs:', words);
    
    // Create a unique, case-insensitive list of words to search for.
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    if (uniqueWords.length === 0) {
      console.log('[Dr. Ordinary] No unique words to highlight');
      return;
    }
    
    const regex = new RegExp(`\\b(${uniqueWords.map(this.escapeRegex).join('|')})\\b`, 'gi');
    console.log('[Dr. Ordinary] Regex pattern:', regex.source);
    
    let totalHighlights = 0;
    
    // Find only pure text nodes that don't contain any HTML
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip if parent has our highlight class
          if (node.parentElement && node.parentElement.classList.contains('dr-ordinary-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip script, style, and other non-content elements
          const parent = node.parentElement;
          if (!parent || parent.tagName.match(/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only process text nodes with actual content
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    console.log(`[Dr. Ordinary] Found ${textNodes.length} text nodes to process`);
    
    // Process each text node carefully
    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const matches = [...text.matchAll(regex)];
      
      if (matches.length === 0) return;
      
      console.log(`[Dr. Ordinary] Found matches: ${matches.map(m => m[0]).join(', ')}`);
      
      // Process matches in reverse order to maintain correct indices
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        
        try {
          // Split the text node at the end of the match
          const afterNode = textNode.splitText(matchEnd);
          
          // Split again at the start of the match
          const matchNode = textNode.splitText(matchStart);
          
          // Create highlight span
          const span = document.createElement('span');
          span.className = 'dr-ordinary-highlight';
          span.textContent = match[0];
          
          // Replace the match node with the span
          matchNode.parentNode.replaceChild(span, matchNode);
          
          // Add click listener to show the side menu
          span.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the document click listener from firing
            this.showInteractionMenu(match[0]);
          });
          
          totalHighlights++;
          console.log(`[Dr. Ordinary] Highlighted: "${match[0]}"`);
          
        } catch (e) {
          console.warn(`[Dr. Ordinary] Failed to highlight "${match[0]}":`, e);
        }
      }
    });
    
    console.log(`[Dr. Ordinary] Highlighting complete. Created ${totalHighlights} highlight spans.`);
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Side Menu Logic ---

  async showInteractionMenu(drugName) {
    console.log(`[Dr. Ordinary] Clicked on: ${drugName}`);
    const menu = this.getSideMenu();

    // Show loading state immediately
    menu.innerHTML = `
      <div class="dr-ordinary-side-menu-header">
        <h3>${drugName}</h3>
      </div>
      <div class="dr-ordinary-side-menu-content">
        <p>Loading interactions...</p>
      </div>
    `;
    menu.classList.add('visible');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getDrugInteractions',
        drugName: drugName
      });

      if (response && response.success) {
        this.renderInteractions(drugName, response.data);
      } else {
        throw new Error(response?.error || 'Failed to get interactions.');
      }
    } catch (error) {
      console.error('[Dr. Ordinary] Error fetching interactions:', error);
      this.renderInteractions(drugName, null, 'Could not load interaction data.');
    }
    
    // Add a one-time click listener to the document to close the menu
    const closeMenu = (event) => {
      if (!menu.contains(event.target)) {
        menu.classList.remove('visible');
        document.removeEventListener('click', closeMenu);
      }
    };
    // Use a timeout to avoid capturing the same click that opened the menu
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  renderInteractions(drugName, interactions, error = null) {
    const menu = this.getSideMenu();
    let contentHtml = '';

    if (error) {
      contentHtml = `<p>${error}</p>`;
    } else if (!interactions || interactions.length === 0) {
      contentHtml = '<p>No interaction information found.</p>';
    } else {
      contentHtml = interactions.map(item => `
        <div class="dr-ordinary-interaction-item severity-${item.severity.toLowerCase()}">
          <div class="dr-ordinary-interaction-title">
            <span>${item.name} (${item.type})</span>
            <span class="dr-ordinary-interaction-severity ${item.severity.toLowerCase()}">${item.severity}</span>
          </div>
          <div class="dr-ordinary-interaction-description">
            ${item.description}
          </div>
        </div>
      `).join('');
    }

    menu.innerHTML = `
      <div class="dr-ordinary-side-menu-header">
        <h3>${drugName}</h3>
      </div>
      <div class="dr-ordinary-side-menu-content">
        ${contentHtml}
      </div>
    `;
  }

  getSideMenu() {
    let menu = document.getElementById('dr-ordinary-side-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'dr-ordinary-side-menu';
      menu.className = 'dr-ordinary-side-menu';
      document.body.appendChild(menu);
    }
    return menu;
  }
}

// Instantiate the class to run the script.
new DrugDetector();

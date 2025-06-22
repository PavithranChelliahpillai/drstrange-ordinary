document.addEventListener('DOMContentLoaded', () => {
    const enabledSwitch = document.getElementById('enabled-switch');
    const drStrangeLink = document.getElementById('dr-strange-link');

    // Set the Dr. Strange link
    // Note: This URL is based on the context menu link in the background script.
    // The main Dr. Strange app runs on port 3000.
    drStrangeLink.href = 'http://localhost:3000'; 

    // Load the saved state for the switch
    chrome.storage.local.get('extensionEnabled', (data) => {
        enabledSwitch.checked = data.extensionEnabled !== false; // Default to true
    });

    // Listen for switch changes
    enabledSwitch.addEventListener('change', () => {
        const isEnabled = enabledSwitch.checked;
        chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
            // Optional: Reload the current tab to apply changes immediately
            // This tells the content script to re-run or not.
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });
}); 
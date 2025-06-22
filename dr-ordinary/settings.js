// Dr. Ordinary Settings Page

// Load settings when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    document.getElementById('saveButton').addEventListener('click', saveSettings);
});

// Load saved settings
function loadSettings() {
    chrome.storage.local.get(['letta_api_key'], function(result) {
        if (result.letta_api_key) {
            document.getElementById('apiKey').value = result.letta_api_key;
        }
    });
}

// Save settings
function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
        showStatus('Please enter a Letta API key', 'error');
        return;
    }
    
    chrome.storage.local.set({
        letta_api_key: apiKey
    }, function() {
        showStatus('Settings saved successfully!', 'success');
        
        // Reload the API key in the background script
        chrome.runtime.reload();
    });
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
} 
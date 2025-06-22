// Dr. Ordinary - Background Service Worker with Letta Integration

// Letta server configuration
const LETTA_API_URL = 'https://api.letta.com/v1/agents/agent-196df9c3-287c-4ce0-8927-ae3be96fe1cf/messages';

let LETTA_API_KEY = "sk-let-OWRkYTlkOTctYmIzNC00YjRiLTk4MmItMDg4MjY3OGZlMGE3OjAwNzM1N2JhLWQ4ZTYtNGQ3ZS1hODZjLWI4MWVkOWExMGYzZA==";

chrome.runtime.onInstalled.addListener(() => {
  console.log('Dr. Ordinary installed successfully');
  
  // Set up context menu
  chrome.contextMenus.create({
    id: 'checkWithDrStrange',
    title: 'Check with Dr. Strange',
    contexts: ['selection']
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeWithLetta') {
    console.log('Received analyzeWithLetta message:', message);

    // This is an asynchronous operation.
    analyzePageWithLetta(message.content, message.url)
      .then(result => {
        console.log('Analysis successful. Sending response:', { success: true, data: result });
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error("A critical error occurred during analysis. Sending failure response:", error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }

  if (message.action === 'getDrugInteractions') {
    console.log(`Received getDrugInteractions message for: ${message.drugName}`);
    getDrugInteractions(message.drugName)
      .then(interactions => {
        sendResponse({ success: true, data: interactions });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      
    return true; // Keep message channel open for async response
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'checkWithDrStrange') {
    const selectedText = info.selectionText;
    const drStrangeUrl = `http://localhost:3000/?drug=${encodeURIComponent(selectedText)}`;
    chrome.tabs.create({ url: drStrangeUrl });
  }
});

// Analyze page content with Letta agent
async function analyzePageWithLetta(content, url) {
  console.log('[BG] analyzePageWithLetta started.');
  if (!LETTA_API_KEY) {
    throw new Error('[BG] Letta API key not set.');
  }

  console.log('[BG] Attempting to fetch from Letta API...');
  
  const response = await fetch(LETTA_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LETTA_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: content }] })
  });
  
  console.log(`[BG] Fetch completed with status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[BG] Letta API error response:', errorText);
    throw new Error(`Letta API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[BG] Full Letta API response received:', JSON.stringify(data, null, 2));

  const messagesArray = data.messages || (Array.isArray(data) ? data : null);
  if (!messagesArray) {
    throw new Error('[BG] Could not find messages array in response.');
  }

  const messageData = messagesArray.find(m => m.message_type === 'assistant_message');
  if (!messageData || !messageData.content) {
    throw new Error('[BG] Could not find valid assistant message content.');
  }

  console.log('[BG] Extracted content from assistant message:', messageData.content);

  const drugObjects = JSON.parse(messageData.content);
  if (!Array.isArray(drugObjects)) {
    throw new Error('[BG] Final parsed content was not an array.');
  }

  if (drugObjects.length > 0 && typeof drugObjects[0] === 'object' && drugObjects[0] !== null) {
    console.log('[BG] Parsing array of objects.');
    return drugObjects.map(obj => obj.drug).filter(Boolean);
  }
  
  console.log('[BG] Parsing array of strings.');
  return drugObjects;
}

// Mock function - replace with actual AI service call
async function getDrugInteractions(drug) {
  console.log(`[BG] Fetching interactions for: ${drug}`);

  // Normalize drug name for comparison
  const normalizedDrug = drug.toLowerCase().trim();

  // Predefined drug interactions database
  const drugInteractions = {
    'ibuprofen': [
      {
        type: 'drug',
        name: 'Anticoagulants / Antiplatelets (e.g., Warfarin, Apixaban, Clopidogrel)',
        severity: 'High',
        description: 'Increased risk of bleeding'
      },
      {
        type: 'drug',
        name: 'Other NSAIDs / Aspirin',
        severity: 'High',
        description: 'Increased risk of GI bleeding, ulcers, and kidney damage. Special Note: Ibuprofen can interfere with the cardioprotective effect of low-dose aspirin if taken together.'
      },
      {
        type: 'drug',
        name: 'ACE Inhibitors / ARBs (e.g., Lisinopril, Losartan)',
        severity: 'Medium',
        description: 'Reduced antihypertensive effect, increased risk of kidney injury'
      },
      {
        type: 'drug',
        name: 'Diuretics (e.g., Furosemide, Hydrochlorothiazide)',
        severity: 'Medium',
        description: 'Decreased diuretic efficacy, risk of nephrotoxicity'
      },
      {
        type: 'drug',
        name: 'Lithium',
        severity: 'High',
        description: 'Increased lithium levels and toxicity'
      }
    ],
    'warfarin': [
      {
        type: 'drug',
        name: 'NSAIDs (e.g., Ibuprofen, Naproxen)',
        severity: 'High',
        description: 'Increased risk of bleeding'
      },
      {
        type: 'drug',
        name: 'Aspirin',
        severity: 'High',
        description: 'Significantly increased bleeding risk'
      },
      {
        type: 'drug',
        name: 'Antibiotics (e.g., Ciprofloxacin, Metronidazole)',
        severity: 'Medium',
        description: 'May increase warfarin effect and bleeding risk'
      }
    ],
    'aspirin': [
      {
        type: 'drug',
        name: 'Warfarin and other Anticoagulants',
        severity: 'High',
        description: 'Significantly increased bleeding risk'
      },
      {
        type: 'drug',
        name: 'Other NSAIDs (e.g., Ibuprofen)',
        severity: 'High',
        description: 'Increased risk of GI bleeding and reduced cardioprotective effect'
      },
      {
        type: 'drug',
        name: 'ACE Inhibitors',
        severity: 'Medium',
        description: 'May reduce antihypertensive effect'
      }
    ],
    'lisinopril': [
      {
        type: 'drug',
        name: 'NSAIDs (e.g., Ibuprofen, Naproxen)',
        severity: 'Medium',
        description: 'Reduced antihypertensive effect, increased risk of kidney injury'
      },
      {
        type: 'drug',
        name: 'Diuretics',
        severity: 'Medium',
        description: 'Risk of hypotension and kidney dysfunction'
      },
      {
        type: 'drug',
        name: 'Potassium Supplements',
        severity: 'Medium',
        description: 'Risk of hyperkalemia'
      }
    ],
    'metformin': [
      {
        type: 'drug',
        name: 'Contrast Agents',
        severity: 'High',
        description: 'Risk of lactic acidosis'
      },
      {
        type: 'drug',
        name: 'Alcohol',
        severity: 'Medium',
        description: 'Increased risk of lactic acidosis and hypoglycemia'
      }
    ]
  };

  // Check if we have interactions for this drug
  if (drugInteractions[normalizedDrug]) {
    return drugInteractions[normalizedDrug];
  }

  // Default response for drugs not in our database
  return [{
    type: 'info',
    name: 'Drug Information',
    severity: 'Low',
    description: 'No specific drug interactions found in our database. Always consult with a healthcare provider about potential interactions.'
  }];
}

 
const fetch = require('node-fetch');

const BASE_URL = 'https://drugcentral.org/api/v1';

async function getDrugInteractions(drugName) {
  try {
    const res = await fetch(`${BASE_URL}/drug/${encodeURIComponent(drugName)}/interactions`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const data = await res.json();

    if (data.length === 0) {
      console.log(`No interactions found for ${drugName}`);
    } else {
      console.log(`Interactions for ${drugName}:`);
      data.forEach(interaction => {
        console.log(`- ${interaction.interacts_with} (${interaction.type}) - ${interaction.severity}`);
      });
    }
  } catch (err) {
    console.error(`Failed to fetch interactions:`, err.message);
  }
}

getDrugInteractions("Atorvastatin");

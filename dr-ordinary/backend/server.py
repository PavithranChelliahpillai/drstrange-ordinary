import os
import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# === CONFIG ===
AGENT_ID = os.getenv("LETTA_AGENT_ID", "agent-432881a4-890f-41d3-8c19-373edbe8770e")
LETTA_API_KEY = os.getenv("LETTA_API_KEY", "your_letta_api_key_here")

# === FUNCTION ===
def extract_drugs(message: str):
    url = f"https://api.letta.com/v1/agents/{AGENT_ID}/messages"
    headers = {
        "Authorization": f"Bearer {LETTA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            print(f"[ERROR {response.status_code}] {response.text}")
            return None

        data = response.json()
        # Adjust this if your agent returns under a different key
        content = data.get("choices", [{}])[0].get("message", {}).get("content")
        
        # Try to parse the content as JSON
        try:
            drugs = json.loads(content)
            if isinstance(drugs, list):
                return drugs
            else:
                print(f"[ERROR] Response is not a list: {drugs}")
                return []
        except json.JSONDecodeError:
            print(f"[ERROR] Failed to parse JSON from content: {content}")
            return []
            
    except Exception as e:
        print(f"[ERROR] Failed to call Letta API: {e}")
        return None

@app.route('/analyze', methods=['POST'])
def analyze_content():
    try:
        data = request.get_json()
        content = data.get('content', '')
        url = data.get('url', '')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        # Create the message for Letta
        message = f"""Analyze this webpage content and identify any drug names mentioned.

URL: {url}
Content: {content[:8000]}

Please identify all drug names (generic and brand names) mentioned in the content.

Respond with ONLY a JSON array of drug names, like this:
["drug1", "drug2", "drug3"]

If no drugs are found, respond with an empty array: []

Do not include any other text, just the JSON array."""
        
        # Extract drugs using Letta
        drugs = extract_drugs(message)
        
        if drugs is None:
            # Fallback to basic keyword detection
            drugs = fallback_drug_detection(content)
        
        return jsonify({'drugs': drugs})
        
    except Exception as e:
        print(f"[ERROR] Server error: {e}")
        return jsonify({'error': str(e)}), 500

def fallback_drug_detection(content):
    """Fallback drug detection using keyword matching"""
    drug_keywords = [
        'advil', 'ibuprofen', 'tylenol', 'acetaminophen', 'aspirin', 'warfarin',
        'metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'levothyroxine',
        'omeprazole', 'metoprolol', 'losartan', 'gabapentin', 'sertraline',
        'trazodone', 'prednisone', 'tramadol', 'hydrocodone', 'oxycodone',
        'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline', 'penicillin'
    ]
    
    content_lower = content.lower()
    found_drugs = [drug for drug in drug_keywords if drug in content_lower]
    return found_drugs

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'agent_id': AGENT_ID})

if __name__ == "__main__":
    print(f"Starting Dr. Ordinary backend server...")
    print(f"Agent ID: {AGENT_ID}")
    print(f"API Key: {'Set' if LETTA_API_KEY != 'your_letta_api_key_here' else 'Not set'}")
    print(f"Server will run on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 
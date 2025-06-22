#!/usr/bin/env python3
"""
Debug script for testing Letta agent connectivity
"""
import asyncio
import aiohttp
import json
import os

# Letta configuration from engine.py
LETTA_API_KEY = os.getenv("LETTA_API_KEY", "sk-let-OWRkYTlkOTctYmIzNC00YjRiLTk4MmItMDg4MjY3OGZlMGE3OjAwNzM1N2JhLWQ4ZTYtNGQ3ZS1hODZjLWI4MWVkOWExMGYzZA==")
BASE_URL = "https://api.letta.com/v1/agents"

AGENTS = {
    "chemical_analyst": "agent-6de06f79-8753-4cba-8a57-299b601cf66a",
    "pathway_analyst": "agent-224412a3-839d-4d67-8f9a-3622424fbbf2", 
    "target_analyst": "agent-4024eaa2-a4e1-4e61-be77-8cd89036aea8",
    "similarity_analyst": "agent-175da398-ebd9-45db-96bc-edaa1f4b6cd4",
    "coordinator": "agent-6108f293-8abe-4b98-bea3-41e2dcff9a79"
}

async def test_single_agent(agent_name: str, agent_id: str):
    """Test a single agent with detailed debugging"""
    print(f"\n🔍 Testing {agent_name} ({agent_id})")
    
    url = f"{BASE_URL}/{agent_id}/messages"
    headers = {
        "Authorization": f"Bearer {LETTA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Simple test message
    payload = {
        "messages": [
            {
                "role": "user",
                "content": "Hello, please respond with 'Working' to confirm connectivity."
            }
        ]
    }
    
    print(f"📡 URL: {url}")
    print(f"🔑 Auth header: Bearer {LETTA_API_KEY[:20]}...")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                status = response.status
                text = await response.text()
                
                print(f"📊 Status: {status}")
                print(f"📄 Response: {text}")
                
                if status == 200:
                    try:
                        data = json.loads(text)
                        print(f"✅ JSON parsed successfully")
                        print(f"🔍 Data structure: {json.dumps(data, indent=2)}")
                        return True
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON parse error: {e}")
                        return False
                else:
                    print(f"❌ HTTP error: {status}")
                    return False
                    
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

async def main():
    """Test all agents"""
    print("🚀 Starting Letta Agent Debug Session")
    print(f"🔑 API Key: {LETTA_API_KEY[:20]}...")
    print(f"🌐 Base URL: {BASE_URL}")
    
    results = {}
    
    for agent_name, agent_id in AGENTS.items():
        success = await test_single_agent(agent_name, agent_id)
        results[agent_name] = success
    
    print("\n" + "="*50)
    print("📊 FINAL RESULTS:")
    for agent_name, success in results.items():
        status = "✅ Working" if success else "❌ Failed"
        print(f"  {agent_name}: {status}")
    
    working = sum(results.values())
    total = len(results)
    print(f"\n🎯 Summary: {working}/{total} agents working")

if __name__ == "__main__":
    asyncio.run(main()) 
import asyncio
import json
import os
import re
from dataclasses import dataclass, asdict
from typing import Dict, Any, List

import aiohttp
from dotenv import load_dotenv

# FastAPI and Pydantic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- Data Structures ---

@dataclass
class DrugInfo:
    """A simple container for drug information."""
    name: str
    smiles: str
    targets: List[str]
    pathways: List[str]
    properties: Dict[str, Any]

# --- Letta Agent System ---

class LettaDDIAgentSystem:
    """A system for orchestrating DDI prediction using multiple Letta agents."""
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("LETTA_API_KEY")
        if not self.api_key:
            raise ValueError("LETTA_API_KEY environment variable not set.")
            
        self.agent_ids = {
            "chemical_analyst": os.getenv("LETTA_CHEMICAL_ANALYST_ID"),
            "pathway_analyst": os.getenv("LETTA_PATHWAY_ANALYST_ID"),
            "target_analyst": os.getenv("LETTA_TARGET_ANALYST_ID"),
            "similarity_analyst": os.getenv("LETTA_SIMILARITY_ANALYST_ID"),
            "coordinator": os.getenv("LETTA_COORDINATOR_ID"),
            "presenter": os.getenv("LETTA_PRESENTER_ID"),
            "risk_labeler": os.getenv("LETTA_RISK_LABELER_ID"),
        }

        if not all(self.agent_ids.values()):
            missing = [k for k, v in self.agent_ids.items() if not v]
            raise ValueError(f"Missing Letta agent ID(s) in environment variables: {', '.join(missing)}")

        self.session = None

    async def _get_session(self):
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    def _clean_json_response(self, text: str) -> str:
        """Removes markdown code blocks and trims whitespace from a string."""
        match = re.search(r"```(json)?(.*)```", text, re.DOTALL)
        if match:
            return match.group(2).strip()
        return text.strip()

    async def run_agent(self, agent_type: str, agent_id: str, prompt: str) -> Dict[str, Any]:
        """Runs a single agent and returns its parsed JSON response."""
        session = await self._get_session()
        url = f"https://api.letta.com/v1/agents/{agent_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {"messages": [{"role": "user", "content": prompt}]}
        
        try:
            async with session.post(url, headers=headers, json=payload, timeout=90) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Error from {agent_type} ({response.status}): {error_text}")
                    return {"error": f"Agent API Error: {error_text}"}
                
                data = await response.json()

                # The /messages endpoint returns a dict containing a 'messages' list.
                if not isinstance(data, dict):
                    print(f"ERROR ({agent_type}): Unexpected response format. Expected dict, got {type(data)}. Response: {data}")
                    return {"error": f"Agent returned unexpected data format: {data}"}

                messages_list = data.get("messages", [])
                if not isinstance(messages_list, list):
                    print(f"ERROR ({agent_type}): 'messages' key did not contain a list. Response: {data}")
                    return {"error": f"Agent response missing 'messages' list: {data}"}
                
                assistant_message = next(
                    (msg.get("content") for msg in reversed(messages_list) if isinstance(msg, dict) and msg.get("message_type") == "assistant_message"),
                    None
                )
                
                if not assistant_message:
                    return {"error": "No assistant message found in response"}
                
                print(f"[DEBUG] Raw assistant message for {agent_type}: {assistant_message}")
                
                cleaned_message = self._clean_json_response(assistant_message)
                
                print(f"[DEBUG] Cleaned message for {agent_type}: {cleaned_message}")
                
                # Special handling for presenter agent - it returns raw text, which we wrap in a dict.
                if agent_type == 'presenter':
                    final_text = cleaned_message.split('\n')[0].strip()
                    return {"summary": final_text}
                
                # Special handling for the new risk labeler agent.
                if agent_type == 'risk_labeler':
                    final_text = cleaned_message.split('\n')[0].strip()
                    return {"risk_label": final_text}

                # Special handling for target_analyst text response
                if agent_type == 'target_analyst' and 'no shared' in cleaned_message.lower():
                     print(f"[INFO] Target analyst reported no shared targets. Creating fallback JSON.")
                     return {"shared_targets": [], "explanation": cleaned_message}

                try:
                    return json.loads(cleaned_message)
                except json.JSONDecodeError as json_error:
                    print(f"[ERROR] JSON decode error for {agent_type}: {json_error}")
                    print(f"[ERROR] Problematic JSON string: {repr(cleaned_message)}")
                    return {"error": f"Failed to parse JSON response: {str(json_error)}"}

        except (asyncio.TimeoutError, aiohttp.ClientError) as e:
            print(f"Error processing {agent_type}: {e}")
            return {"error": str(e)}

    async def get_risk_label_from_agent(self, analysis: Dict[str, Any]) -> str:
        """Uses an agent to determine a risk label from a coordinator's analysis."""
        if "error" in analysis:
            return "Unknown"

        print("🏷️  Querying Risk Labeler Agent...")
        
        prompt = f"""
        Analyze the provided JSON. Classify the risk into one of these exact categories: Very high, High, Moderate, Low, None.
        Your response must contain ONLY the category name and nothing else. Do not add any explanation or conversational text.

        Analysis JSON:
        {json.dumps(analysis, indent=2)}
        """
        
        response = await self.run_agent(
            "risk_labeler",
            self.agent_ids["risk_labeler"],
            prompt
        )
        
        return response.get("risk_label", "Unknown")

    async def summarize_analysis(self, agent_type: str, analysis: Dict[str, Any]) -> str:
        """Uses the presenter agent to summarize a specialist agent's analysis."""
        if "error" in analysis:
            return f"Could not generate summary for {agent_type} because its analysis failed."
        
        # SPECIAL CASE: If target_analyst finds no shared targets, create a clean, hardcoded summary.
        if agent_type == 'target_analyst' and not analysis.get('shared_targets'):
            print(f"✍️  Generating hardcoded summary for {agent_type} (no shared targets).")
            return "The analysis found no shared protein targets between the two drugs."

        print(f"✍️ Summarizing analysis from {agent_type}...")
        
        # Convert analysis to a clean JSON string
        analysis_json = json.dumps(analysis, indent=2)
        
        # Create a more specific prompt based on agent type
        if agent_type == 'similarity_analyst':
            presenter_prompt = f"""Summarize this similarity analysis in one clear sentence for a healthcare professional. Focus on the confidence score and inferred interaction.

Analysis data:
{analysis_json}

Provide only the summary sentence, no other text."""
        elif agent_type == 'chemical_analyst':
            presenter_prompt = f"""Summarize this chemical analysis in one clear sentence for a healthcare professional. Focus on the risk score and interaction hypothesis.

Analysis data:
{analysis_json}

Provide only the summary sentence, no other text."""
        elif agent_type == 'pathway_analyst':
            presenter_prompt = f"""Summarize this pathway analysis in one clear sentence for a healthcare professional. Focus on the pathway interactions and risk level.

Analysis data:
{analysis_json}

Provide only the summary sentence, no other text."""
        else:
            presenter_prompt = f"""Summarize this {agent_type} analysis in one clear sentence for a healthcare professional.

Analysis data:
{analysis_json}

Provide only the summary sentence, no other text."""
        
        # Debugging log to print the analysis data
        print(f"[DEBUG] Analysis for {agent_type}: {analysis_json}")
        
        summary_response = await self.run_agent(
            "presenter",
            self.agent_ids["presenter"],
            presenter_prompt
        )
        
        return summary_response.get("summary", "Summary could not be generated by the presenter agent.")

    # Manual fallback function to generate a summary
    def manual_summary_fallback(self, agent_type: str, analysis: Dict[str, Any]) -> str:
        if agent_type == 'similarity_analyst':
            drug1_analogs = analysis.get('drug1_analogs', {}).get('analogs', [])
            drug2_analogs = analysis.get('drug2_analogs', {}).get('analogs', [])
            inferred_interaction = analysis.get('inferred_interaction', 'No inferred interaction available.')
            confidence_score = analysis.get('confidence_score', 'Unknown')

            summary = f"The similarity analysis suggests a high risk of interaction between the drugs due to their analogs. {inferred_interaction} Confidence score: {confidence_score}."
            return summary

        return "No manual summary available."

    async def run_agents(self, drug1: DrugInfo, drug2: DrugInfo) -> Dict[str, Any]:
        """Runs all specialist agents and summarizes their findings."""
        prompts = {
            "chemical_analyst": f"Drug 1: {drug1.name}, Drug 2: {drug2.name}. Analyze chemical properties.",
            "pathway_analyst": f"Drug 1: {drug1.name} (Pathways: {drug1.pathways}), Drug 2: {drug2.name} (Pathways: {drug2.pathways}). Analyze shared pathways.",
            "target_analyst": f"Drug 1: {drug1.name} (Targets: {drug1.targets}), Drug 2: {drug2.name} (Targets: {drug2.targets}). Analyze shared targets.",
            "similarity_analyst": f"Drug 1: {drug1.name} (SMILES: {drug1.smiles}), Drug 2: {drug2.name} (SMILES: {drug2.smiles}). Analyze structural similarity.",
        }
        
        agent_types = list(prompts.keys())
        analysis_tasks = [self.run_agent(at, self.agent_ids[at], p) for at, p in prompts.items()]
        analyses = await asyncio.gather(*analysis_tasks)
        
        summary_tasks = [self.summarize_analysis(agent_types[i], analyses[i]) for i in range(len(agent_types))]
        summaries = await asyncio.gather(*summary_tasks)
        
        return {
            agent_types[i]: {"analysis": analyses[i], "summary": summaries[i]}
            for i in range(len(agent_types))
        }

    def get_risk_label(self, risk_score: float) -> str:
        """Returns a descriptive label for a given risk score."""
        if not isinstance(risk_score, (int, float)):
            return "Unknown"
        if risk_score >= 0.8:
            return "Very High"
        if risk_score >= 0.6:
            return "High"
        if risk_score >= 0.4:
            return "Moderate"
        if risk_score > 0.1:
            return "Low"
        return "Minimal"

    async def predict_ddi(self, drug1: DrugInfo, drug2: DrugInfo) -> Dict[str, Any]:
        """
        Runs the full DDI analysis pipeline, including summarization and labeling.
        """
        agent_responses = await self.run_agents(drug1, drug2)

        # We need to extract just the raw analysis for the coordinator
        coordinator_input_analyses = {k: v["analysis"] for k, v in agent_responses.items()}

        coordinator_input = {
            "drug1": asdict(drug1),
            "drug2": asdict(drug2),
            "agent_analyses": coordinator_input_analyses
        }
        
        print("🔬 Sending collected analyses to Coordinator Agent...")
        coordinator_response = await self.run_agent(
            "coordinator", 
            self.agent_ids["coordinator"], 
            json.dumps(coordinator_input, indent=2)
        )

        presenter_summary = {"error": "Coordinator agent failed, cannot generate summary."}
        risk_label = "Unknown"

        if "error" not in coordinator_response:
            print("✍️  Querying Presenter and Risk Labeler agents in parallel...")
            
            # Use a different prompt for the final executive summary to be more thorough
            executive_summary_prompt = f"""
            You are an expert medical summarizer. Analyze the following JSON, which contains the final verdict on a drug-drug interaction.
            Create a clear, human-readable summary for a healthcare professional. Explain the final risk score, the reasoning, and the key interaction mechanisms identified.
            Your response must contain ONLY the summary text and nothing else.

            JSON Analysis:
            {json.dumps(coordinator_response, indent=2)}
            """
            
            presenter_task = self.run_agent("presenter", self.agent_ids["presenter"], executive_summary_prompt)
            risk_labeler_task = self.get_risk_label_from_agent(coordinator_response)

            summary_response, risk_label_text = await asyncio.gather(presenter_task, risk_labeler_task)
            
            presenter_summary = summary_response
            risk_label = risk_label_text
            coordinator_response["risk_label"] = risk_label

        return {
            "agent_responses": agent_responses,
            "final_verdict": coordinator_response,
            "presenter_summary": presenter_summary,
        }

# --- In-Memory Drug Database ---
# (In a real application, this would be a proper database)
DRUG_DATABASE = {
    "warfarin": DrugInfo(
        name="Warfarin",
        smiles="CC(=O)C1=C(C2=CC=CC=C2OC1=O)C3=CC=C(C=C3)O",
        targets=["VKORC1", "CYP2C9"],
        pathways=["coagulation_cascade", "vitamin_k_metabolism"],
        properties={"protein_binding": 99, "half_life": 40}
    ),
    "aspirin": DrugInfo(
        name="Aspirin",
        smiles="CC(=O)OC1=CC=CC=C1C(=O)O",
        targets=["PTGS1", "PTGS2"],
        pathways=["arachidonic_acid_metabolism", "platelet_aggregation"],
        properties={"protein_binding": 80, "half_life": 0.25}
    ),
    "ibuprofen": DrugInfo(
        name="Ibuprofen",
        smiles="CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
        targets=["PTGS1", "PTGS2"],
        pathways=["arachidonic_acid_metabolism"],
        properties={"protein_binding": 99, "half_life": 2}
    ),
    "acetaminophen": DrugInfo(
        name="Acetaminophen",
        smiles="CC(=O)NC1=CC=C(O)C=C1",
        targets=["PTGS1", "TRPA1"],
        pathways=["glucuronidation", "sulfation"],
        properties={"protein_binding": 20, "half_life": 2.5}
    )
}

# --- FastAPI App ---
app = FastAPI(
    title="Dr. Strange DDI Engine",
    description="A multi-agent system using Letta Cloud for DDI prediction."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DDIRequest(BaseModel):
    drug1_name: str
    drug2_name: str

ddi_system = LettaDDIAgentSystem()

@app.post("/predict", summary="Predict Drug-Drug Interaction")
async def predict_ddi_endpoint(request: DDIRequest):
    """
    Takes two drug names, looks them up, and runs the full DDI analysis pipeline.
    """
    drug1_name = request.drug1_name.lower()
    drug2_name = request.drug2_name.lower()

    if drug1_name not in DRUG_DATABASE or drug2_name not in DRUG_DATABASE:
        missing = [d for d in [drug1_name, drug2_name] if d not in DRUG_DATABASE]
        return {"error": f"Drugs not found in database: {', '.join(missing)}"}, 404

    drug1 = DRUG_DATABASE[drug1_name]
    drug2 = DRUG_DATABASE[drug2_name]
    
    # The session needs to be managed within the request context for FastAPI
    async with aiohttp.ClientSession() as session:
        ddi_system.session = session
        result = await ddi_system.predict_ddi(drug1, drug2)
        return result

if __name__ == "__main__":
    print("🚀 Starting Dr. Strange FastAPI Server...")
    # Note: Use `reload=True` for development to auto-reload on code changes.
    uvicorn.run("engine:app", host="0.0.0.0", port=8000, reload=True)
import { NextRequest, NextResponse } from 'next/server'

// Mock AI model - replace with actual implementation
interface DrugInteraction {
  id: string
  drug1: string
  drug2: string
  severity: 'high' | 'medium' | 'low'
  description: string
  mechanism: string
  management: string
  confidence: number
}

// Drug interaction database (mock)
const drugInteractionDB = [
  {
    drugs: ['warfarin', 'aspirin'],
    interaction: {
              severity: 'high' as const,
      description: 'Increased risk of bleeding when used together',
      mechanism: 'Both drugs affect platelet aggregation and coagulation cascade',
      management: 'Monitor INR closely, consider dose adjustment or alternative therapy',
      confidence: 0.92
    }
  },
  {
    drugs: ['metformin', 'alcohol'],
    interaction: {
      severity: 'medium',
      description: 'Risk of lactic acidosis and hypoglycemia',
      mechanism: 'Alcohol enhances metformin effects and impairs glucose metabolism',
      management: 'Advise patient to limit alcohol consumption',
      confidence: 0.78
    }
  },
  {
    drugs: ['ibuprofen', 'lisinopril'],
    interaction: {
      severity: 'medium',
      description: 'Reduced antihypertensive effect and potential kidney damage',
      mechanism: 'NSAIDs can reduce ACE inhibitor efficacy and cause nephrotoxicity',
      management: 'Monitor blood pressure and kidney function',
      confidence: 0.85
    }
  }
]

function findInteractions(drug1: string, drug2: string): DrugInteraction[] {
  const results: DrugInteraction[] = []
  
  // Normalize drug names
  const normalizedDrug1 = drug1.toLowerCase().trim()
  const normalizedDrug2 = drug2.toLowerCase().trim()
  
  // Check direct matches
  drugInteractionDB.forEach((entry, index) => {
    const matchesExact = 
      (entry.drugs.includes(normalizedDrug1) && entry.drugs.includes(normalizedDrug2)) ||
      (entry.drugs.includes(normalizedDrug2) && entry.drugs.includes(normalizedDrug1))
    
    if (matchesExact) {
      results.push({
        id: `direct-${index}`,
        drug1: drug1,
        drug2: drug2,
        ...entry.interaction
      })
    }
  })
  
  // If no direct matches, simulate AI prediction with similar drugs
  if (results.length === 0) {
    // Mock AI prediction based on drug similarity
    const predictedInteractions = generatePredictedInteractions(drug1, drug2)
    results.push(...predictedInteractions)
  }
  
  return results
}

function generatePredictedInteractions(drug1: string, drug2: string): DrugInteraction[] {
  // This would be replaced with actual AI model inference
  const mockPredictions: DrugInteraction[] = [
    {
      id: 'ai-prediction-1',
      drug1: drug1,
      drug2: drug2,
      severity: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      description: 'AI-predicted potential interaction based on molecular structure analysis',
      mechanism: 'Predicted mechanism based on pharmacokinetic and pharmacodynamic modeling',
      management: 'Monitor patient closely and consult clinical documentation',
      confidence: 0.65 + Math.random() * 0.25 // 65-90% confidence
    }
  ]
  
  return mockPredictions
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { drug1_name, drug2_name } = body;

    if (!drug1_name || !drug2_name) {
      return NextResponse.json(
        { error: "Both drug names are required" },
        { status: 400 }
      );
    }
    
    // The Python server is running on localhost:8000
    const pythonApiUrl = "http://localhost:8000/predict";

    const response = await fetch(pythonApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drug1_name,
        drug2_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Forward the error from the Python service
      return NextResponse.json(
        { error: errorData.error || `Python API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in Next.js API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Drug Interaction Prediction API',
    version: '1.0.0',
    endpoints: {
      predict: {
        method: 'POST',
        description: 'Predict drug interactions',
        parameters: {
          drug1: 'string - First drug name',
          drug2: 'string - Second drug name'
        }
      }
    }
  })
} 
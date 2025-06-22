// Shared Drug Database and Utilities
export interface Drug {
  name: string
  genericName: string
  brandNames: string[]
  category: string
  mechanism: string
  commonUse: string[]
}

export interface DrugInteraction {
  id: string
  drug1: string
  drug2: string
  severity: 'high' | 'medium' | 'low'
  description: string
  mechanism: string
  management: string
  confidence: number
}

export const DRUG_DATABASE: Drug[] = [
  {
    name: 'warfarin',
    genericName: 'warfarin',
    brandNames: ['Coumadin', 'Jantoven'],
    category: 'anticoagulant',
    mechanism: 'Vitamin K antagonist',
    commonUse: ['atrial fibrillation', 'deep vein thrombosis', 'pulmonary embolism']
  },
  {
    name: 'aspirin',
    genericName: 'aspirin',
    brandNames: ['Bayer', 'Bufferin', 'Ecotrin'],
    category: 'NSAID',
    mechanism: 'COX inhibitor',
    commonUse: ['pain relief', 'inflammation', 'cardioprotection']
  },
  {
    name: 'metformin',
    genericName: 'metformin',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
    category: 'antidiabetic',
    mechanism: 'Biguanide - reduces glucose production',
    commonUse: ['type 2 diabetes', 'prediabetes']
  },
  {
    name: 'ibuprofen',
    genericName: 'ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nuprin'],
    category: 'NSAID',
    mechanism: 'COX inhibitor',
    commonUse: ['pain relief', 'inflammation', 'fever reduction']
  },
  {
    name: 'lisinopril',
    genericName: 'lisinopril',
    brandNames: ['Prinivil', 'Zestril'],
    category: 'ACE inhibitor',
    mechanism: 'Angiotensin-converting enzyme inhibitor',
    commonUse: ['hypertension', 'heart failure', 'post-MI cardioprotection']
  }
]

export const KNOWN_INTERACTIONS: Omit<DrugInteraction, 'id'>[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'high',
    description: 'Increased risk of bleeding when used together',
    mechanism: 'Both drugs affect platelet aggregation and coagulation cascade',
    management: 'Monitor INR closely, consider dose adjustment or alternative therapy',
    confidence: 0.92
  },
  {
    drug1: 'metformin',
    drug2: 'alcohol',
    severity: 'medium',
    description: 'Risk of lactic acidosis and hypoglycemia',
    mechanism: 'Alcohol enhances metformin effects and impairs glucose metabolism',
    management: 'Advise patient to limit alcohol consumption',
    confidence: 0.78
  },
  {
    drug1: 'ibuprofen',
    drug2: 'lisinopril',
    severity: 'medium',
    description: 'Reduced antihypertensive effect and potential kidney damage',
    mechanism: 'NSAIDs can reduce ACE inhibitor efficacy and cause nephrotoxicity',
    management: 'Monitor blood pressure and kidney function',
    confidence: 0.85
  },
  {
    drug1: 'warfarin',
    drug2: 'ibuprofen',
    severity: 'high',
    description: 'Significantly increased bleeding risk',
    mechanism: 'NSAID effects on platelet function combined with anticoagulation',
    management: 'Avoid combination if possible, use alternative analgesic',
    confidence: 0.89
  }
]

// Utility functions
export function findDrug(searchTerm: string): Drug | undefined {
  const normalized = searchTerm.toLowerCase().trim()
  return DRUG_DATABASE.find(drug => 
    drug.name.toLowerCase() === normalized ||
    drug.genericName.toLowerCase() === normalized ||
    drug.brandNames.some(brand => brand.toLowerCase() === normalized)
  )
}

export function searchDrugs(query: string): Drug[] {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return []
  
  return DRUG_DATABASE.filter(drug =>
    drug.name.toLowerCase().includes(normalized) ||
    drug.genericName.toLowerCase().includes(normalized) ||
    drug.brandNames.some(brand => brand.toLowerCase().includes(normalized)) ||
    drug.category.toLowerCase().includes(normalized)
  )
}

export function findKnownInteractions(drug1: string, drug2: string): DrugInteraction[] {
  const normalized1 = drug1.toLowerCase().trim()
  const normalized2 = drug2.toLowerCase().trim()
  
  return KNOWN_INTERACTIONS
    .filter(interaction => 
      (interaction.drug1.toLowerCase() === normalized1 && interaction.drug2.toLowerCase() === normalized2) ||
      (interaction.drug1.toLowerCase() === normalized2 && interaction.drug2.toLowerCase() === normalized1)
    )
    .map((interaction, index) => ({
      id: `known-${index}`,
      ...interaction
    }))
}

export function generateInteractionId(drug1: string, drug2: string): string {
  const sortedDrugs = [drug1, drug2].sort()
  return `${sortedDrugs[0]}-${sortedDrugs[1]}-${Date.now()}`
} 
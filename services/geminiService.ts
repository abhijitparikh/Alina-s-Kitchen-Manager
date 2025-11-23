
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBusinessAdvice = async (
  prompt: string,
  contextData: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Context about Alina's Kitchen (Cloud Kitchen in Netherlands):
      ${contextData}
      
      User Question: ${prompt}
      `,
      config: {
        systemInstruction: "You are a senior business consultant specializing in F&B and Cloud Kitchens in the Netherlands. You provide actionable, data-driven advice on scaling, marketing, and operations. Keep answers concise and practical. Use Euro (€) for currency.",
      }
    });
    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI Advisor.";
  }
};

export const analyzeFinances = async (
  expenses: string,
  revenue: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following financial data for an Indian Cloud Kitchen in NL. Suggest cost-saving measures and scaling opportunities.\n\nExpenses: ${expenses}\nRevenue Summary: ${revenue}`,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing finances.";
  }
};

export const analyzeInvoiceImage = async (base64Image: string): Promise<{description: string, amount: number, category: string, vatRate: number} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Image
            }
          },
          {
            text: "Analyze this invoice image. Extract the main description, total amount, categorize it [Ingredients, Packaging, Marketing, Utilities, Salary, Other], and estimate the VAT rate (0, 9, or 21 based on Dutch tax laws for the items). Return JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            vatRate: { type: Type.NUMBER, description: "VAT Rate in percentage (0, 9, or 21)" }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

export interface MenuSuggestion {
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
}

export const curateMenu = async (ingredients: string): Promise<MenuSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have these ingredients/leftovers available in my cloud kitchen: ${ingredients}. 
      Suggest 4-5 Indian menu items I can cook today for my Dutch and Indian customers. 
      Includes names, appetizing descriptions, estimated price in Euro, category (Starter/Main/Dessert), and boolean for isVegetarian.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING },
              isVegetarian: { type: Type.BOOLEAN }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MenuSuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Menu Error:", error);
    return [];
  }
};

export interface ComplianceItemData {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Hygiene' | 'Tax' | 'Legal' | 'Admin';
}

export const generateComplianceChecklist = async (details: BusinessDetails): Promise<ComplianceItemData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Generate a strict legal compliance checklist for a business in the Netherlands based on these specific details:
        
        Business Name: ${details.tradeName}
        Legal Form: ${details.legalForm} (Note: Affects Income Tax vs Corporate Tax)
        Sector: ${details.sector}
        
        Operational Details:
        - Serves Alcohol: ${details.servesAlcohol ? "YES (Requires Alcohol Licensing & Social Hygiene)" : "NO"}
        - Has Staff: ${details.hasStaff ? "YES (Requires Payroll Tax, Arbo, RI&E)" : "NO"}
        - Small Business Scheme (KOR): ${details.isKorEligible ? "Eligible (Revenue < €20k, Exempt from VAT)" : "No"}

        Focus on Dutch specific laws:
        1. NVWA / HACCP (Hygiene Code)
        2. Belastingdienst (BTW, IB/VPB)
        3. Gemeente (Municipal permits)
        
        Return 6-8 key items tailored to these flags.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              category: { type: Type.STRING, enum: ['Hygiene', 'Tax', 'Legal', 'Admin'] }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ComplianceItemData[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Compliance Error:", error);
    return [];
  }
};
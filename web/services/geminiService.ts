import { GoogleGenAI, Type } from "@google/genai";
import { Specification, ArchitecturePlan, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyD1TUz8eWckQuu38pQsJ9CM07g64_5FGik' });
const MODEL_NAME = "gemini-2.5-flash";

// --- Schema Definitions for JSON Output ---

const SPEC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          description: { type: Type.STRING },
          painPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["role", "description", "painPoints"]
      }
    },
    requirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["id", "title", "description", "priority"]
      }
    },
    successCriteria: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    followUpQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of questions to clarify ambiguities in the product description."
    }
  },
  required: ["personas", "requirements", "successCriteria", "followUpQuestions"]
};

const PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING },
    stack: { type: Type.ARRAY, items: { type: Type.STRING } },
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["Frontend", "Backend", "Database", "Service"] },
          tech: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["name", "type", "tech", "description"]
      }
    },
    databaseSchema: { type: Type.STRING }
  },
  required: ["overview", "stack", "components", "databaseSchema"]
};

const TASKS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      status: { type: Type.STRING, enum: ["Todo"] },
      complexity: { type: Type.STRING, enum: ["S", "M", "L"] },
      assignedTo: { type: Type.STRING, enum: ["AI"] }
    },
    required: ["id", "title", "description", "status", "complexity", "assignedTo"]
  }
};

// --- Service Methods ---

export const generateSpecification = async (description: string): Promise<Partial<Specification>> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a Senior Product Manager. Analyze this product description and generate a detailed specification.
      
      Instructions:
      1. Create detailed User Personas and Functional Requirements.
      2. CRITICAL: If the description is vague, high-level, or missing key details, you MUST generate 2-4 specific "followUpQuestions" that will help clarify the scope (e.g., "What platform?", "Who is the primary user?", "Any specific integrations?").
      3. Even if you ask questions, provide a "best effort" draft specification based on what is currently known.
      
      Product Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: SPEC_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating spec:", error);
    throw error;
  }
};

export const generateArchitecture = async (spec: Specification): Promise<ArchitecturePlan> => {
  try {
    const specContext = JSON.stringify(spec);
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a Principal Software Architect. Based on the following specification, design a technical architecture. 
      Include the Tech Stack, Key Components (Frontend, Backend, DB), and a text-based Database Schema representation (Mermaid or simple markdown tables).
      
      Specification: ${specContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: PLAN_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateTasks = async (spec: Specification, plan: ArchitecturePlan): Promise<Task[]> => {
  try {
    const context = `Spec: ${JSON.stringify(spec)}\nPlan: ${JSON.stringify(plan)}`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a Technical Project Manager. Break down this project into actionable implementation tasks. 
      Ensure tasks cover setup, frontend components, backend endpoints, and integration. 
      
      Project Context: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: TASKS_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating tasks:", error);
    throw error;
  }
};

export const generateTaskCode = async (task: Task, plan: ArchitecturePlan): Promise<string> => {
  try {
    const context = `Task: ${JSON.stringify(task)}\nArchitecture Stack: ${plan.stack.join(", ")}`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a Senior Full Stack Engineer. Implement the following task. 
      Return ONLY the code logic. If multiple files are needed, use comments to separate them.
      Do not include markdown backticks like \`\`\`typescript. Just the raw code.
      
      Context: ${context}`,
      config: {
        maxOutputTokens: 4000,
      }
    });

    return response.text || "// No code generated";
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
};

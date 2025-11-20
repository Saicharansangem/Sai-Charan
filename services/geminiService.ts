import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerRecommendation, UserProfile, JobMatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

// Schema for Career Recommendations
const careerRecommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          matchScore: { type: Type.NUMBER, description: "Probability score (0-100)." },
          description: { type: Type.STRING },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          sharedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          salaryRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
            },
          },
          reasoning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "SHAP-style feature importance explanations." },
          learningResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['course', 'article', 'book', 'video'] },
                url: { type: Type.STRING },
              }
            }
          }
        },
      },
    },
  },
};

export const getCareerRecommendations = async (input: string | UserProfile): Promise<CareerRecommendation[]> => {
  const systemInstruction = `
    You are NextStep AI, an advanced Career Engine powered by a simulated dataset of over 50 million job descriptions and career trajectories.
    
    Your Task:
    1. Analyze the user input to extract skills, experience, and intent.
    2. Simulate a "Random Forest" classification against global job market data to find the top 3 career matches.
    3. Perform a "Gap Analysis": Identify precisely which skills the user LACKS compared to the industry standard for those roles.
    
    DATASET SIMULATION PARAMETERS:
    - Draw from recent 2024-2025 hiring trends in Tech, Finance, Healthcare, and Engineering.
    - Penalize specific missing hard skills in the "matchScore".
    - Prioritize "Missing Skills" that are critical for employability in the recommended role.

    User Types:
    - STUDENTS: Recommend paths based on potential. Gaps = Curriculum/Certifications needed.
    - PROFESSIONALS: Recommend paths for growth. Gaps = Advanced tools/Leadership skills.
  `;

  let userContent = "";
  if (typeof input === 'string') {
    userContent = `User Prompt: "${input}"`;
  } else {
    userContent = `
      User Profile:
      - Type: ${input.userType}
      - Name: ${input.fullName}
      - Current Title: ${input.currentTitle}
      - Experience: ${input.yearsExperience} years
      - Education: ${input.educationLevel} in ${input.major}
      - Skills: ${input.skills.join(', ')}
      - Interests: ${input.interests.join(', ')}
      - Desired Industry: ${input.desiredIndustry}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: careerRecommendationSchema,
        temperature: 0.3,
      },
    });

    const json = JSON.parse(response.text || "{}");
    return json.recommendations || [];
  } catch (error) {
    console.error("Error fetching career recommendations:", error);
    throw new Error("Failed to generate recommendations.");
  }
};

export const analyzeJobMatch = async (profile: UserProfile, jobDescription: string): Promise<JobMatchResult> => {
    const systemInstruction = `
      You are a Job Match Analyst. Compare the candidate's profile against the job description.
      Identify shared skills, missing skills, calculate a match percentage score based on skill overlap and experience relevance, and provide a short analysis.
    `;

    const userContent = `
      Candidate Profile:
      - Skills: ${profile.skills.join(', ')}
      - Experience: ${profile.currentTitle}, ${profile.yearsExperience} years.
      - Education: ${profile.educationLevel} in ${profile.major}

      Job Description:
      "${jobDescription}"
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        jobId: { type: Type.STRING, description: "A unique identifier for this job analysis (e.g. generated UUID)" },
        matchScore: { type: Type.NUMBER, description: "0-100 score" },
        sharedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        analysis: { type: Type.STRING, description: "A brief summary of the fit." },
      },
      required: ["matchScore", "sharedSkills", "missingSkills", "analysis"]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: userContent,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1,
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        const result = JSON.parse(text);
        
        // Ensure ID exists if model didn't generate it well
        if (!result.jobId) result.jobId = "job-" + Date.now();
        
        return result;
    } catch (error) {
        console.error("Error analyzing job match:", error);
        throw new Error("Failed to analyze job match.");
    }
};
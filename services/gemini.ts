
import { GoogleGenAI } from "@google/genai";

// Fix: Always use named parameter and process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAISupport = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Tu es l'assistant intelligent d'ElectraPay, une application de recharge de compteurs CIE (Compagnie Ivoirienne d'Électricité). 
        Aide les utilisateurs avec leurs problèmes de recharge, explique comment trouver le numéro de compteur (souvent 11 chiffres sous le code barre), 
        ou explique les codes d'erreur courants. Sois poli, concis et utilise un ton chaleureux ivoirien si approprié.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, je rencontre une petite difficulté technique. Veuillez réessayer plus tard.";
  }
};

export const getQuickInsight = async (credit: number, power: number) => {
  try {
    const prompt = `L'utilisateur a actuellement ${credit.toFixed(1)} kWh de crédit et consomme ${power} Watts en temps réel. Donne un conseil ultra-court (max 15 mots) pour optimiser sa consommation ou sa recharge.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Tu es Electra-Bot. Tu donnes des conseils d'expert en énergie CIE. Ton ton est pro et percutant."
      }
    });
    return response.text;
  } catch (error) {
    return "Surveillez vos appareils gourmands pour prolonger votre autonomie.";
  }
};

export const generateRechargeToken = () => {
  // Simulates a 20-digit CIE token: XXXX XXXX XXXX XXXX XXXX
  const segments = [];
  for (let i = 0; i < 5; i++) {
    segments.push(Math.floor(1000 + Math.random() * 9000).toString());
  }
  return segments.join(' ');
};

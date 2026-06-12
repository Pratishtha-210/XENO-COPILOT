import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICustomer, IOrder } from '../db/connection';

export interface AIAnalysisResult {
  campaignName: string;
  recommendedChannel: 'Email' | 'WhatsApp' | 'SMS';
  audienceCriteria: {
    totalSpendMin?: number;
    lastOrderDaysAgo?: number;
    specificProduct?: string;
  };
  messageTemplate: string;
  suggestedCTAs: string[];
  campaignSummary: string;
}

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
let liveGenAI: any = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    // Correct initialization: Gemini SDK changed. We can use standard library import or direct fetch.
    // The package @google/generative-ai is supported.
    const genAI = new GoogleGenerativeAI(apiKey);
    liveGenAI = genAI;
    console.log('✨ [AI] Gemini API initialized in LIVE mode.');
  } catch (error: any) {
    console.warn(`[AI] Failed to initialize Gemini Live. Falling back to Mock. Error: ${error.message}`);
  }
} else {
  console.log('🤖 [AI] No Gemini API key provided. Initializing in INTENTIONAL MOCK mode.');
}

// Core service implementation
export const aiService = {
  /**
   * Analyzes the natural language goal and converts it into a structural plan.
   */
  analyzeGoal: async (goalText: string): Promise<AIAnalysisResult> => {
    if (liveGenAI) {
      try {
        console.log(`[AI] Dispatching live Gemini prompt: "${goalText}"`);
        const model = liveGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const systemInstruction = `
          You are an AI Campaign Copilot for a marketing CRM.
          Your task is to analyze the marketer's goal and return a JSON configuration.
          The output must be pure JSON with no markdown block notation or text around it.
          JSON properties required:
          - campaignName: string (a catchy name)
          - recommendedChannel: "Email" | "WhatsApp" | "SMS"
          - audienceCriteria: { totalSpendMin?: number, lastOrderDaysAgo?: number, specificProduct?: string }
          - messageTemplate: string (a personalized template with placeholders like {{name}}, {{lastProduct}}, {{totalSpend}}, {{inactiveDays}})
          - suggestedCTAs: string[] (array of 2-3 call-to-action button labels)
          - campaignSummary: string (short marketing rationale)

          Analyze constraints:
          - If "coffee" or "latte" is mentioned, set specificProduct to "Coffee"
          - If "sneaker" or "shoe" is mentioned, set specificProduct to "Sneakers"
          - If "spend" or "spent" or "vip" is mentioned with a number (e.g. 5000), set totalSpendMin.
          - If "days" or "inactive" is mentioned with a number (e.g. 30 days), set lastOrderDaysAgo.
        `;

        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nMarketer Prompt: "${goalText}"` }] }],
        });

        const text = response.response.text().trim();
        // Extract JSON block if Gemini surrounds it with markdown ```json
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as AIAnalysisResult;
        }
        return JSON.parse(text) as AIAnalysisResult;
      } catch (err: any) {
        console.warn(`[AI] Live Gemini invocation failed (${err.message}). Falling back to Mock engine.`);
      }
    }

    // Mock Engine Fallback (Rich Keyword Parser)
    return compileMockAIResponse(goalText);
  },

  /**
   * Generates a fully custom, individual message for a specific customer based on history
   */
  generatePersonalizedMessage: async (
    template: string,
    customer: ICustomer,
    orders: IOrder[]
  ): Promise<string> => {
    // Calculate values
    const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;
    const lastProduct = lastOrder ? lastOrder.itemBought : 'your favorite item';
    
    let inactiveDays = 15;
    if (customer.lastOrderDate) {
      const diffTime = Math.abs(new Date().getTime() - new Date(customer.lastOrderDate).getTime());
      inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Basic template interpolation
    let message = template
      .replace(/\{\{name\}\}/gi, customer.name)
      .replace(/\{\{lastProduct\}\}/gi, lastProduct)
      .replace(/\{\{totalSpend\}\}/gi, customer.totalSpend.toString())
      .replace(/\{\{inactiveDays\}\}/gi, inactiveDays.toString());

    // In a live system, you could use Gemini to re-phrase this message differently for each customer to add flavor.
    // Let's add custom personalized sentences depending on customer spend and item bought!
    if (customer.totalSpend > 5000) {
      message = `🌟 [VIP Special] ` + message;
    }

    return message;
  }
};

// HELPER: Mock Compiler
function compileMockAIResponse(goalText: string): AIAnalysisResult {
  const normalized = goalText.toLowerCase();

  // 1. Detect Products
  let specificProduct: string | undefined;
  if (normalized.includes('coffee') || normalized.includes('latte') || normalized.includes('cappuccino') || normalized.includes('espresso')) {
    specificProduct = 'Coffee';
  } else if (normalized.includes('sneaker') || normalized.includes('shoe') || normalized.includes('nike') || normalized.includes('adidas') || normalized.includes('running')) {
    specificProduct = 'Sneakers';
  }

  // 2. Detect Spend Minimum
  let totalSpendMin: number | undefined;
  const spendRegex = /(?:spend|spent|worth)\s*(?:above|over|>|more than)?\s*₹?\s*(\d+)/i;
  const spendMatch = normalized.match(spendRegex);
  if (spendMatch && spendMatch[1]) {
    totalSpendMin = parseInt(spendMatch[1], 10);
  } else if (normalized.includes('vip') || normalized.includes('premium')) {
    totalSpendMin = 4000;
  }

  // 3. Detect Inactivity Days
  let lastOrderDaysAgo: number | undefined;
  const daysRegex = /(\d+)\s*(?:days|day|days ago|months?)/i;
  const daysMatch = normalized.match(daysRegex);
  if (daysMatch && daysMatch[1]) {
    const value = parseInt(daysMatch[1], 10);
    // If user says "1 month"
    if (normalized.includes('month')) {
      lastOrderDaysAgo = value * 30;
    } else {
      lastOrderDaysAgo = value;
    }
  } else if (normalized.includes('inactive') || normalized.includes('haven\'t ordered') || normalized.includes('comeback')) {
    lastOrderDaysAgo = 30;
  }

  // 4. Formulate Campaign Details based on Product Categories
  if (specificProduct === 'Coffee') {
    return {
      campaignName: 'Coffee Lovers Re-activation ☕',
      recommendedChannel: 'WhatsApp',
      audienceCriteria: {
        specificProduct: 'Coffee',
        totalSpendMin: totalSpendMin || 0,
        lastOrderDaysAgo: lastOrderDaysAgo || 30
      },
      messageTemplate: 'Hey {{name}}! ☕ We noticed it has been {{inactiveDays}} days since your last order of {{lastProduct}}! We miss brewing for you. Here is a flat 20% discount on your next visit. Use code BREW20 at checkout! Let us catch up soon!',
      suggestedCTAs: ['Order Coffee Now', 'View Menu', 'Unsubscribe'],
      campaignSummary: 'Targeting previous coffee customers with high open-rate WhatsApp channels to drive instant caffeine craving re-activation.'
    };
  }

  if (specificProduct === 'Sneakers') {
    return {
      campaignName: 'Sneaker Head Exclusive Drop 👟',
      recommendedChannel: 'Email',
      audienceCriteria: {
        specificProduct: 'Sneakers',
        totalSpendMin: totalSpendMin || 0,
        lastOrderDaysAgo: lastOrderDaysAgo || 45
      },
      messageTemplate: 'Subject: Exclusive 15% VIP Discount on Sneakers! 👟\n\nDear {{name}},\n\nYour shoe game deserves the best. We noticed you previously bought {{lastProduct}} from Xeno. We just restocked some premium sneakers and wanted to offer you an exclusive 15% off.\n\nUse code SNEAKER15 to upgrade your style. Total spend to date: ₹{{totalSpend}}.',
      suggestedCTAs: ['Shop Sneakers', 'Explore Lookbook'],
      campaignSummary: 'Re-engaging premium fashion consumers via visually rich email marketing showcasing sneaker stock updates.'
    };
  }

  // VIP target
  if (totalSpendMin && totalSpendMin >= 3000) {
    return {
      campaignName: 'VIP Appreciation Gala ✨',
      recommendedChannel: 'Email',
      audienceCriteria: {
        totalSpendMin,
        lastOrderDaysAgo: lastOrderDaysAgo || 0
      },
      messageTemplate: 'Subject: A Golden Welcome Back for our VIPs ✨\n\nDear {{name}},\n\nYou are one of our most valued shoppers (total spent: ₹{{totalSpend}}). We want to thank you for your loyalty by offering you first-access to our upcoming limited collection.\n\nClaim your VIP invite using the link below.',
      suggestedCTAs: ['Claim VIP Invite', 'Talk to Concierge'],
      campaignSummary: 'Fostering brand relationship and loyalty amongst high-value clients who spent over ₹' + totalSpendMin + '.'
    };
  }

  // General fallback
  return {
    campaignName: 'Xeno Winback Campaign 🎯',
    recommendedChannel: 'SMS',
    audienceCriteria: {
      totalSpendMin: totalSpendMin || 0,
      lastOrderDaysAgo: lastOrderDaysAgo || 30
    },
    messageTemplate: 'Hey {{name}}! We miss you at Xeno. It has been {{inactiveDays}} days since you ordered {{lastProduct}}. Get a special 10% discount on your next order with code WELCOME10. Shop now: bit.ly/xeno-shop',
    suggestedCTAs: ['Shop Now', 'Opt Out'],
    campaignSummary: 'SMS-based budget winback push to re-engage inactive customers who have ordered previously.'
  };
}

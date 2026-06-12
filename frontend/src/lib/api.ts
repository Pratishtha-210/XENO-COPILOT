const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  lastOrderDate: string | null;
  createdAt: string;
  orders?: Order[];
}

export interface Order {
  _id: string;
  customerId: string;
  itemBought: string;
  price: number;
  quantity: number;
  orderDate: string;
}

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  audienceCriteria: any;
  audienceSize: number;
  status: 'Draft' | 'Running' | 'Completed';
  messageTemplate: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  createdAt: string;
}

export interface CampaignLog {
  _id: string;
  campaignId: string;
  customerId: string;
  recipientDetails: {
    name: string;
    email: string;
    phone: string;
  };
  customMessage: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sentAt: string;
  updatedAt: string;
}

export interface DashboardAnalytics {
  customerCount: number;
  campaignCount: number;
  activeCampaigns: number;
  completedCampaigns: number;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
  };
}

export const api = {
  getCustomers: async (): Promise<{ databaseMode: string; count: number; customers: Customer[] }> => {
    const res = await fetch(`${BASE_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  seedCustomers: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/customers/seed`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to seed customers');
    return res.json();
  },

  analyzeGoal: async (goal: string): Promise<{
    analysis: {
      campaignName: string;
      recommendedChannel: 'Email' | 'WhatsApp' | 'SMS';
      audienceCriteria: any;
      messageTemplate: string;
      suggestedCTAs: string[];
      campaignSummary: string;
    };
    estimatedAudienceSize: number;
    matchedCustomers: Partial<Customer>[];
  }> => {
    const res = await fetch(`${BASE_URL}/ai/analyze-goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error('Failed to analyze goal');
    return res.json();
  },

  createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  },

  sendCampaign: async (id: string): Promise<{ message: string; audienceSize: number }> => {
    const res = await fetch(`${BASE_URL}/campaigns/${id}/send`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to send campaign');
    }
    return res.json();
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await fetch(`${BASE_URL}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  getCampaignDetails: async (id: string): Promise<{ campaign: Campaign; logs: CampaignLog[] }> => {
    const res = await fetch(`${BASE_URL}/campaigns/${id}`);
    if (!res.ok) throw new Error('Failed to fetch campaign details');
    return res.json();
  },

  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
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

export interface Segment {
  _id: string;
  name: string;
  description: string;
  audienceCriteria: any;
  audienceSize: number;
  createdAt: string;
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
  segmentCount: number;
  totalRevenue: number;
  revenueTimeline: Array<{ month: string; revenue: number }>;
  topCities: Array<{ city: string; count: number }>;
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

// Transparent self-healing flag
let useMockSandbox = false;

const fetchWithFallback = async (url: string, options?: RequestInit) => {
  if (useMockSandbox) {
    throw new Error('Sandbox mode active');
  }
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    console.warn(`[API] Standalone network fallback activated due to error:`, err);
    useMockSandbox = true;
    throw err;
  }
};

// Default static seeds for standalone browser sandbox
const defaultCustomersMock: Customer[] = [
  {
    _id: "mock_cust_1",
    name: "Pratishtha Sharma",
    email: "pratishtha@example.com",
    phone: "9876543210",
    city: "Bangalore",
    totalSpend: 750,
    lastOrderDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_1", customerId: "mock_cust_1", itemBought: "Filter Coffee", price: 750, quantity: 1, orderDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_2",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "9812345678",
    city: "Delhi",
    totalSpend: 5400,
    lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_2", customerId: "mock_cust_2", itemBought: "Premium Sneakers", price: 5400, quantity: 1, orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_3",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "9988776655",
    city: "Hyderabad",
    totalSpend: 320,
    lastOrderDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_3", customerId: "mock_cust_3", itemBought: "Filter Coffee", price: 320, quantity: 1, orderDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_4",
    name: "Rohan Das",
    email: "rohan.das@example.com",
    phone: "9123456789",
    city: "Lucknow",
    totalSpend: 900,
    lastOrderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_4", customerId: "mock_cust_4", itemBought: "Tea Infuser", price: 900, quantity: 1, orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_5",
    name: "Sanya Kapoor",
    email: "sanya@example.com",
    phone: "9898989898",
    city: "Chandigarh",
    totalSpend: 6200,
    lastOrderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_5", customerId: "mock_cust_5", itemBought: "Premium Sneakers", price: 6200, quantity: 1, orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_6",
    name: "Kabir Singh",
    email: "kabir.singh@example.com",
    phone: "9777777777",
    city: "Delhi",
    totalSpend: 450,
    lastOrderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_6", customerId: "mock_cust_6", itemBought: "Filter Coffee", price: 450, quantity: 1, orderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_7",
    name: "Zara Patel",
    email: "zara.patel@example.com",
    phone: "9666666666",
    city: "Bangalore",
    totalSpend: 8200,
    lastOrderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_7", customerId: "mock_cust_7", itemBought: "Leather Boots", price: 8200, quantity: 1, orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }]
  }
];

const defaultSegmentsMock: Segment[] = [
  {
    _id: "mock_seg_1",
    name: "Coffee Winback Segment",
    description: "Coffee buyers who spent over ₹500 but haven't ordered in 30 days.",
    audienceCriteria: { totalSpendMin: 500, lastOrderDaysAgo: 30, specificProduct: "Coffee" },
    audienceSize: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_seg_2",
    name: "Premium Sneaker VIPs",
    description: "Premium sneaker shoppers who spent above ₹5000 in our database.",
    audienceCriteria: { totalSpendMin: 5000, specificProduct: "Sneakers" },
    audienceSize: 2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const defaultCampaignsMock: Campaign[] = [
  {
    _id: "mock_camp_1",
    name: "Premium Sneaker VIP Launch",
    description: "Target premium sneaker shoppers who spent above ₹5000 in our database.",
    channel: "Email",
    audienceCriteria: { totalSpendMin: 5000, specificProduct: "Sneakers" },
    audienceSize: 2,
    status: "Completed",
    messageTemplate: "Hey [Name], get early access to our new Premium Sneakers collection! You spent a total of [Total Spend] with us, so you are in our VIP tier.",
    sentCount: 2,
    deliveredCount: 2,
    openedCount: 1,
    clickedCount: 1,
    failedCount: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Parser Regex logic client-side
const parseGoalClientSide = (goal: string) => {
  const lowercase = goal.toLowerCase();
  
  let recommendedChannel: 'Email' | 'WhatsApp' | 'SMS' = 'Email';
  if (lowercase.includes('whatsapp') || lowercase.includes('phone') || lowercase.includes('chat')) {
    recommendedChannel = 'WhatsApp';
  } else if (lowercase.includes('sms') || lowercase.includes('text')) {
    recommendedChannel = 'SMS';
  } else if (lowercase.includes('email') || lowercase.includes('mail')) {
    recommendedChannel = 'Email';
  }
  
  let totalSpendMin: number | undefined;
  const spendRegex = /(?:spend|spent|spending|above|over|more than|exceeding)\s?(?:₹|inr|rs)?\s?(\d+)/i;
  const spendMatch = goal.match(spendRegex);
  if (spendMatch) {
    totalSpendMin = parseFloat(spendMatch[1]);
  }
  
  let lastOrderDaysAgo: number | undefined;
  const inactivityRegex = /(\d+)\s*days/i;
  const inactivityMatch = goal.match(inactivityRegex);
  if (inactivityMatch) {
    lastOrderDaysAgo = parseInt(inactivityMatch[1]);
  }
  
  let specificProduct: string | undefined;
  const productRegex = /(?:bought|ordered|purchased)\s+([a-zA-Z\s]+?)(?:\s+who|\s+but|\s+and|\s+in|\s+over|\s+above|$)/i;
  const productMatch = goal.match(productRegex);
  if (productMatch) {
    specificProduct = productMatch[1].trim();
  }
  
  return {
    recommendedChannel,
    totalSpendMin,
    lastOrderDaysAgo,
    specificProduct
  };
};

const filterCustomersMock = (customers: Customer[], criteria: any) => {
  return customers.filter(c => {
    if (criteria.totalSpendMin && c.totalSpend < criteria.totalSpendMin) return false;
    
    if (criteria.lastOrderDaysAgo && c.lastOrderDate) {
      const diffTime = Math.abs(Date.now() - new Date(c.lastOrderDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < criteria.lastOrderDaysAgo) return false;
    }
    
    if (criteria.specificProduct) {
      const boughtItem = c.orders?.some(o => o.itemBought.toLowerCase().includes(criteria.specificProduct.toLowerCase()));
      if (!boughtItem) return false;
    }
    
    return true;
  });
};

const runMockSimulation = (campaignId: string, matchedCustomers: Customer[], template: string) => {
  const getLogsList = (): CampaignLog[] => {
    const stored = localStorage.getItem('xeno_logs');
    return stored ? JSON.parse(stored) : [];
  };
  
  const saveLogs = (list: CampaignLog[]) => localStorage.setItem('xeno_logs', JSON.stringify(list));
  
  const getCampaignsList = (): Campaign[] => {
    const stored = localStorage.getItem('xeno_campaigns');
    return stored ? JSON.parse(stored) : [];
  };
  
  const saveCampaigns = (list: Campaign[]) => localStorage.setItem('xeno_campaigns', JSON.stringify(list));

  // 1. Setup initial logs
  let currentLogs = getLogsList();
  const newLogs: CampaignLog[] = matchedCustomers.map(cust => ({
    _id: `mock_log_${campaignId}_${cust._id}`,
    campaignId,
    customerId: cust._id,
    recipientDetails: { name: cust.name, email: cust.email, phone: cust.phone },
    customMessage: template
      .replace('[Name]', cust.name)
      .replace('[Total Spend]', `₹${cust.totalSpend}`)
      .replace('[Product]', cust.orders?.[0]?.itemBought || 'items'),
    status: 'sent',
    sentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  currentLogs = currentLogs.concat(newLogs);
  saveLogs(currentLogs);

  let campaigns = getCampaignsList();
  let camp = campaigns.find(c => c._id === campaignId);
  if (camp) {
    camp.sentCount = matchedCustomers.length;
    saveCampaigns(campaigns);
  }

  // 2. Start delayed simulation cascade (1.5s per step)
  setTimeout(() => {
    let logs = getLogsList();
    let campaignsList = getCampaignsList();
    let targetCamp = campaignsList.find(c => c._id === campaignId);

    let delivered = 0;
    let failed = 0;

    newLogs.forEach(nLog => {
      const matchLog = logs.find(l => l._id === nLog._id);
      if (matchLog) {
        const isDelivered = Math.random() > 0.1; // 90% delivery
        matchLog.status = isDelivered ? 'delivered' : 'failed';
        matchLog.updatedAt = new Date().toISOString();
        if (isDelivered) delivered++;
        else failed++;
      }
    });

    if (targetCamp) {
      targetCamp.deliveredCount = delivered;
      targetCamp.failedCount = failed;
      saveCampaigns(campaignsList);
    }
    saveLogs(logs);

    setTimeout(() => {
      let openLogs = getLogsList();
      let openCampaignsList = getCampaignsList();
      let openCamp = openCampaignsList.find(c => c._id === campaignId);
      
      let opened = 0;

      newLogs.forEach(nLog => {
        const matchLog = openLogs.find(l => l._id === nLog._id);
        if (matchLog && matchLog.status === 'delivered') {
          const isOpen = Math.random() > 0.35; // 65% open rate
          if (isOpen) {
            matchLog.status = 'opened';
            matchLog.updatedAt = new Date().toISOString();
            opened++;
          }
        }
      });

      if (openCamp) {
        openCamp.openedCount = opened;
        saveCampaigns(openCampaignsList);
      }
      saveLogs(openLogs);

      setTimeout(() => {
        let clickLogs = getLogsList();
        let clickCampaignsList = getCampaignsList();
        let clickCamp = clickCampaignsList.find(c => c._id === campaignId);

        let clicked = 0;

        newLogs.forEach(nLog => {
          const matchLog = clickLogs.find(l => l._id === nLog._id);
          if (matchLog && matchLog.status === 'opened') {
            const isClick = Math.random() > 0.6; // 40% click rate
            if (isClick) {
              matchLog.status = 'clicked';
              matchLog.updatedAt = new Date().toISOString();
              clicked++;
            }
          }
        });

        if (clickCamp) {
          clickCamp.clickedCount = clicked;
          clickCamp.status = 'Completed';
          saveCampaigns(clickCampaignsList);
        }
        saveLogs(clickLogs);
      }, 1500);
    }, 1500);
  }, 1500);
};

const getMockStore = () => {
  if (typeof window === 'undefined') {
    return {
      getCustomers: async () => ({ databaseMode: 'Vercel Sandbox', count: 0, customers: [] }),
      seedCustomers: async () => ({ message: 'Mock reset complete' }),
      getSegments: async () => [],
      createSegment: async (data: any) => data,
      getCampaigns: async () => [],
      createCampaign: async (data: any) => data,
      sendCampaign: async () => ({ message: 'Simulating...', audienceSize: 0 }),
      getCampaignDetails: async (id: string) => ({ campaign: {} as any, logs: [] }),
      getDashboardAnalytics: async () => ({} as any),
      analyzeGoal: async () => ({} as any)
    };
  }

  const getOrInit = (key: string, defaultData: any) => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  };

  const getCustomersList = (): Customer[] => getOrInit('xeno_customers', defaultCustomersMock);
  const getSegmentsList = (): Segment[] => getOrInit('xeno_segments', defaultSegmentsMock);
  const getCampaignsList = (): Campaign[] => getOrInit('xeno_campaigns', defaultCampaignsMock);
  const getLogsList = (): CampaignLog[] => getOrInit('xeno_logs', []);

  const saveCustomers = (list: Customer[]) => localStorage.setItem('xeno_customers', JSON.stringify(list));
  const saveSegments = (list: Segment[]) => localStorage.setItem('xeno_segments', JSON.stringify(list));
  const saveCampaigns = (list: Campaign[]) => localStorage.setItem('xeno_campaigns', JSON.stringify(list));

  return {
    getCustomers: async () => {
      const list = getCustomersList();
      return { databaseMode: 'Vercel Sandbox', count: list.length, customers: list };
    },
    
    seedCustomers: async () => {
      localStorage.setItem('xeno_customers', JSON.stringify(defaultCustomersMock));
      localStorage.setItem('xeno_segments', JSON.stringify(defaultSegmentsMock));
      localStorage.setItem('xeno_campaigns', JSON.stringify(defaultCampaignsMock));
      localStorage.setItem('xeno_logs', JSON.stringify([]));
      return { message: 'Local storage reset to default mock values.' };
    },

    getSegments: async () => {
      return getSegmentsList();
    },

    createSegment: async (data: Partial<Segment>) => {
      const list = getSegmentsList();
      const customers = getCustomersList();
      const criteria = data.audienceCriteria || {};
      const matched = filterCustomersMock(customers, criteria);
      
      const newSeg: Segment = {
        _id: `mock_seg_${Date.now()}`,
        name: data.name || 'Unnamed Segment',
        description: data.description || '',
        audienceCriteria: criteria,
        audienceSize: matched.length,
        createdAt: new Date().toISOString()
      };
      
      list.push(newSeg);
      saveSegments(list);
      return newSeg;
    },

    getCampaigns: async () => {
      return getCampaignsList();
    },

    createCampaign: async (data: Partial<Campaign>) => {
      const list = getCampaignsList();
      const customers = getCustomersList();
      const criteria = data.audienceCriteria || {};
      const matched = filterCustomersMock(customers, criteria);
      
      const newCamp: Campaign = {
        _id: `mock_camp_${Date.now()}`,
        name: data.name || 'Unnamed Campaign',
        description: data.description || '',
        channel: data.channel || 'Email',
        audienceCriteria: criteria,
        audienceSize: matched.length,
        status: 'Draft',
        messageTemplate: data.messageTemplate || '',
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        failedCount: 0,
        createdAt: new Date().toISOString()
      };
      
      list.push(newCamp);
      saveCampaigns(list);
      return newCamp;
    },

    getCampaignDetails: async (id: string) => {
      const campaigns = getCampaignsList();
      const logs = getLogsList();
      
      const campaign = campaigns.find(c => c._id === id);
      if (!campaign) throw new Error('Campaign not found');
      
      const campaignLogs = logs.filter(l => l.campaignId === id);
      return { campaign, logs: campaignLogs };
    },

    sendCampaign: async (id: string) => {
      const campaigns = getCampaignsList();
      const campaignIndex = campaigns.findIndex(c => c._id === id);
      if (campaignIndex === -1) throw new Error('Campaign not found');
      
      const campaign = campaigns[campaignIndex];
      const customers = getCustomersList();
      const matched = filterCustomersMock(customers, campaign.audienceCriteria);
      
      if (matched.length === 0) {
        return { 
          message: 'Campaign saved as draft.', 
          audienceSize: 0, 
          warning: 'Audience segment is empty. Cannot send campaign.' 
        };
      }

      campaign.status = 'Running';
      campaign.sentCount = 0;
      campaign.deliveredCount = 0;
      campaign.openedCount = 0;
      campaign.clickedCount = 0;
      campaign.failedCount = 0;
      saveCampaigns(campaigns);

      runMockSimulation(id, matched, campaign.messageTemplate);

      return { message: 'Campaign sending simulation started.', audienceSize: matched.length };
    },

    getDashboardAnalytics: async () => {
      const customers = getCustomersList();
      const campaigns = getCampaignsList();
      const segments = getSegmentsList();
      
      const totalRev = customers.reduce((sum, c) => sum + c.totalSpend, 0);
      
      let totalSent = 0;
      let totalDelivered = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalFailed = 0;
      
      campaigns.forEach(c => {
        totalSent += c.sentCount || 0;
        totalDelivered += c.deliveredCount || 0;
        totalOpened += c.openedCount || 0;
        totalClicked += c.clickedCount || 0;
        totalFailed += c.failedCount || 0;
      });

      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

      const timeline = [
        { month: 'Jan', revenue: Math.round(totalRev * 0.1) },
        { month: 'Feb', revenue: Math.round(totalRev * 0.15) },
        { month: 'Mar', revenue: Math.round(totalRev * 0.12) },
        { month: 'Apr', revenue: Math.round(totalRev * 0.2) },
        { month: 'May', revenue: Math.round(totalRev * 0.18) },
        { month: 'Jun', revenue: Math.round(totalRev * 0.25) }
      ];

      return {
        customerCount: customers.length,
        campaignCount: campaigns.length,
        segmentCount: segments.length,
        totalRevenue: totalRev,
        revenueTimeline: timeline,
        topCities: [
          { city: 'Bangalore', count: customers.filter(c => c.city === 'Bangalore').length },
          { city: 'Delhi', count: customers.filter(c => c.city === 'Delhi').length },
          { city: 'Hyderabad', count: customers.filter(c => c.city === 'Hyderabad').length },
          { city: 'Lucknow', count: customers.filter(c => c.city === 'Lucknow').length },
          { city: 'Chandigarh', count: customers.filter(c => c.city === 'Chandigarh').length }
        ],
        metrics: {
          sent: totalSent,
          delivered: totalDelivered,
          opened: totalOpened,
          clicked: totalClicked,
          failed: totalFailed,
          openRate: Math.round(openRate),
          clickRate: Math.round(clickRate),
          deliveryRate: Math.round(deliveryRate)
        }
      };
    },

    analyzeGoal: async (goal: string) => {
      const parsed = parseGoalClientSide(goal);
      const customers = getCustomersList();
      const matched = filterCustomersMock(customers, parsed);

      const keywords = parsed.specificProduct || 'our brand';
      const ctas = parsed.recommendedChannel === 'Email' 
        ? ['Claim Discount', 'Shop Collection'] 
        : parsed.recommendedChannel === 'WhatsApp' 
        ? ['Order Now', 'View Catalog'] 
        : ['Opt In', 'Details'];

      return {
        analysis: {
          campaignName: `AI Suggested: ${keywords} Promotion`,
          recommendedChannel: parsed.recommendedChannel,
          audienceCriteria: {
            totalSpendMin: parsed.totalSpendMin,
            lastOrderDaysAgo: parsed.lastOrderDaysAgo,
            specificProduct: parsed.specificProduct
          },
          messageTemplate: `Hi [Name]! We noticed you loved [Product] and have spent a total of [Total Spend] with us. Get 15% off your next purchase using code WINBACK15.`,
          suggestedCTAs: ctas,
          campaignSummary: `This campaign targets ${matched.length} customer(s) who match the goal profile, sending personalized outreach via ${parsed.recommendedChannel}.`
        },
        estimatedAudienceSize: matched.length,
        matchedCustomers: matched.map(m => ({ _id: m._id, name: m.name, email: m.email, phone: m.phone, totalSpend: m.totalSpend }))
      };
    }
  };
};

export const api = {
  getCustomers: async (): Promise<{ databaseMode: string; count: number; customers: Customer[] }> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return await res.json();
    } catch (err) {
      return getMockStore().getCustomers();
    }
  },

  seedCustomers: async (): Promise<{ message: string }> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/customers/seed`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to seed customers');
      return await res.json();
    } catch (err) {
      return getMockStore().seedCustomers();
    }
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
    try {
      const res = await fetchWithFallback(`${BASE_URL}/ai/analyze-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      if (!res.ok) throw new Error('Failed to analyze goal');
      return await res.json();
    } catch (err) {
      return getMockStore().analyzeGoal(goal);
    }
  },

  getSegments: async (): Promise<Segment[]> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/segments`);
      if (!res.ok) throw new Error('Failed to fetch segments');
      return await res.json();
    } catch (err) {
      return getMockStore().getSegments();
    }
  },

  createSegment: async (segmentData: Partial<Segment>): Promise<Segment> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(segmentData),
      });
      if (!res.ok) throw new Error('Failed to create segment');
      return await res.json();
    } catch (err) {
      return getMockStore().createSegment(segmentData);
    }
  },

  createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      return await res.json();
    } catch (err) {
      return getMockStore().createCampaign(campaignData);
    }
  },

  sendCampaign: async (id: string): Promise<{ message: string; audienceSize: number; warning?: string }> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/campaigns/${id}/send`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send campaign');
      }
      return await res.json();
    } catch (err) {
      return getMockStore().sendCampaign(id);
    }
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/campaigns`);
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return await res.json();
    } catch (err) {
      return getMockStore().getCampaigns();
    }
  },

  getCampaignDetails: async (id: string): Promise<{ campaign: Campaign; logs: CampaignLog[] }> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/campaigns/${id}`);
      if (!res.ok) throw new Error('Failed to fetch campaign details');
      return await res.json();
    } catch (err) {
      return getMockStore().getCampaignDetails(id);
    }
  },

  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/analytics/dashboard`);
      if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
      return await res.json();
    } catch (err) {
      return getMockStore().getDashboardAnalytics();
    }
  },
};

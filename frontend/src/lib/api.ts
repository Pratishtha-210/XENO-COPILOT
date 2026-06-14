const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('xeno_custom_backend_url');
    if (customUrl) {
      return customUrl;
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const isLocalIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      if (isLocalIp) {
        return `http://${hostname}:5000/api`;
      }
    }
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();


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
  convertedCount: number;
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
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted';
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
    converted: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
    conversionRate: number;
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
  },
  {
    _id: "mock_cust_8",
    name: "Aditya Verma",
    email: "aditya.verma@example.com",
    phone: "9555566666",
    city: "Delhi",
    totalSpend: 9500,
    lastOrderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_8", customerId: "mock_cust_8", itemBought: "Premium Sneakers", price: 9500, quantity: 1, orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_9",
    name: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "9444455555",
    city: "Hyderabad",
    totalSpend: 280,
    lastOrderDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_9", customerId: "mock_cust_9", itemBought: "Filter Coffee", price: 280, quantity: 1, orderDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_10",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "9333344444",
    city: "Bangalore",
    totalSpend: 210,
    lastOrderDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_10", customerId: "mock_cust_10", itemBought: "Filter Coffee", price: 210, quantity: 1, orderDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_11",
    name: "Sneha Reddy",
    email: "sneha.r@example.com",
    phone: "9222233333",
    city: "Hyderabad",
    totalSpend: 570,
    lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_11", customerId: "mock_cust_11", itemBought: "Cold Brew Coffee", price: 570, quantity: 1, orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_12",
    name: "Rohan Gupta",
    email: "rohan.g@example.com",
    phone: "9111122222",
    city: "Lucknow",
    totalSpend: 11500,
    lastOrderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_12", customerId: "mock_cust_12", itemBought: "Premium Sneakers", price: 11500, quantity: 1, orderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_13",
    name: "Divya Nair",
    email: "divya.n@example.com",
    phone: "9000011111",
    city: "Chandigarh",
    totalSpend: 280,
    lastOrderDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_13", customerId: "mock_cust_13", itemBought: "Filter Coffee", price: 280, quantity: 1, orderDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_14",
    name: "Varun Das",
    email: "varun.d@example.com",
    phone: "8999988888",
    city: "Bangalore",
    totalSpend: 120,
    lastOrderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_14", customerId: "mock_cust_14", itemBought: "Filter Coffee", price: 120, quantity: 1, orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_15",
    name: "Karthik Raja",
    email: "karthik.raja@example.com",
    phone: "8888877777",
    city: "Hyderabad",
    totalSpend: 250,
    lastOrderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_15", customerId: "mock_cust_15", itemBought: "Filter Coffee", price: 250, quantity: 1, orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_16",
    name: "Harish Kalyan",
    email: "harish.kalyan@example.com",
    phone: "8777766666",
    city: "Delhi",
    totalSpend: 220,
    lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_16", customerId: "mock_cust_16", itemBought: "Cold Brew Coffee", price: 220, quantity: 1, orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_17",
    name: "Harini Shah",
    email: "harini.s@example.com",
    phone: "8666655555",
    city: "Lucknow",
    totalSpend: 10800,
    lastOrderDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_17", customerId: "mock_cust_17", itemBought: "Premium Sneakers", price: 10800, quantity: 1, orderDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_18",
    name: "Amit Joshi",
    email: "amit.j@example.com",
    phone: "8555544444",
    city: "Chandigarh",
    totalSpend: 4800,
    lastOrderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_18", customerId: "mock_cust_18", itemBought: "Premium Sneakers", price: 4800, quantity: 1, orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_19",
    name: "Shreya Sen",
    email: "shreya.s@example.com",
    phone: "8444433333",
    city: "Bangalore",
    totalSpend: 350,
    lastOrderDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_19", customerId: "mock_cust_19", itemBought: "Filter Coffee", price: 350, quantity: 1, orderDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_20",
    name: "Nitin Saxena",
    email: "nitin.s@example.com",
    phone: "8333322222",
    city: "Delhi",
    totalSpend: 7800,
    lastOrderDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_20", customerId: "mock_cust_20", itemBought: "Premium Sneakers", price: 7800, quantity: 1, orderDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_21",
    name: "Preeti Bose",
    email: "preeti.b@example.com",
    phone: "8222211111",
    city: "Hyderabad",
    totalSpend: 680,
    lastOrderDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_21", customerId: "mock_cust_21", itemBought: "Cold Brew Coffee", price: 680, quantity: 1, orderDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_22",
    name: "Arjun Pillai",
    email: "arjun.p@example.com",
    phone: "8111100000",
    city: "Bangalore",
    totalSpend: 7400,
    lastOrderDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_22", customerId: "mock_cust_22", itemBought: "Premium Sneakers", price: 7400, quantity: 1, orderDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_23",
    name: "Kiran More",
    email: "kiran.m@example.com",
    phone: "8000099999",
    city: "Lucknow",
    totalSpend: 1100,
    lastOrderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_23", customerId: "mock_cust_23", itemBought: "Tea Infuser", price: 1100, quantity: 1, orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_24",
    name: "Sameer Deshmukh",
    email: "sameer.d@example.com",
    phone: "7999988888",
    city: "Chandigarh",
    totalSpend: 4200,
    lastOrderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_24", customerId: "mock_cust_24", itemBought: "Premium Sneakers", price: 4200, quantity: 1, orderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() }]
  },
  {
    _id: "mock_cust_25",
    name: "Ritu Phogat",
    email: "ritu.p@example.com",
    phone: "7888877777",
    city: "Delhi",
    totalSpend: 650,
    lastOrderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    orders: [{ _id: "order_25", customerId: "mock_cust_25", itemBought: "Filter Coffee", price: 650, quantity: 1, orderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }]
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

const defaultLogsMock: CampaignLog[] = [
  {
    _id: "mock_log_sneaker_1",
    campaignId: "mock_camp_1",
    customerId: "mock_cust_2", // Aarav Mehta
    recipientDetails: { name: "Aarav Mehta", email: "aarav.mehta@example.com", phone: "9812345678" },
    customMessage: "Hey Aarav Mehta, get early access to our new Premium Sneakers collection! You spent a total of ₹5400 with us, so you are in our VIP tier.",
    status: "converted",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_log_sneaker_2",
    campaignId: "mock_camp_1",
    customerId: "mock_cust_5", // Sanya Kapoor
    recipientDetails: { name: "Sanya Kapoor", email: "sanya@example.com", phone: "9898989898" },
    customMessage: "Hey Sanya Kapoor, get early access to our new Premium Sneakers collection! You spent a total of ₹6200 with us, so you are in our VIP tier.",
    status: "delivered",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_log_sneaker_3",
    campaignId: "mock_camp_1",
    customerId: "mock_cust_12", // Rohan Gupta
    recipientDetails: { name: "Rohan Gupta", email: "rohan.g@example.com", phone: "9111122222" },
    customMessage: "Hey Rohan Gupta, get early access to our new Premium Sneakers collection! You spent a total of ₹11500 with us, so you are in our VIP tier.",
    status: "opened",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_log_coffee_1",
    campaignId: "mock_camp_2",
    customerId: "mock_cust_1", // Pratishtha Sharma
    recipientDetails: { name: "Pratishtha Sharma", email: "pratishtha@example.com", phone: "9876543210" },
    customMessage: "Hi Pratishtha Sharma! We noticed you loved Filter Coffee and have spent a total of ₹750 with us. Get 15% off your next purchase using code WINBACK15.",
    status: "clicked", // Ready to convert!
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_log_coffee_2",
    campaignId: "mock_camp_2",
    customerId: "mock_cust_3", // Ananya Iyer
    recipientDetails: { name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "9988776655" },
    customMessage: "Hi Ananya Iyer! We noticed you loved Filter Coffee and have spent a total of ₹320 with us. Get 15% off your next purchase using code WINBACK15.",
    status: "opened",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_log_coffee_3",
    campaignId: "mock_camp_2",
    customerId: "mock_cust_7", // Zara Patel
    recipientDetails: { name: "Zara Patel", email: "zara.patel@example.com", phone: "9666666666" },
    customMessage: "Hi Zara Patel! We noticed you loved Leather Boots and have spent a total of ₹8200 with us. Get 15% off your next purchase using code WINBACK15.",
    status: "clicked",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString()
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
    convertedCount: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "mock_camp_2",
    name: "Coffee Winback Promotion",
    description: "Re-engage coffee buyers with a custom 15% discount code.",
    channel: "WhatsApp",
    audienceCriteria: { totalSpendMin: 300, specificProduct: "Coffee" },
    audienceSize: 2,
    status: "Running",
    messageTemplate: "Hi [Name]! We noticed you loved [Product] and have spent a total of [Total Spend] with us. Get 15% off your next purchase using code WINBACK15.",
    sentCount: 2,
    deliveredCount: 2,
    openedCount: 2,
    clickedCount: 1,
    failedCount: 0,
    convertedCount: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
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
    customMessage: (() => {
      let msg = template
        .replace(/\[Name\]/gi, cust.name)
        .replace(/\{\{name\}\}/gi, cust.name)
        .replace(/\[Total Spend\]/gi, `₹${cust.totalSpend}`)
        .replace(/\{\{totalSpend\}\}/gi, cust.totalSpend.toString())
        .replace(/\[Product\]/gi, cust.orders?.[0]?.itemBought || 'items')
        .replace(/\{\{lastProduct\}\}/gi, cust.orders?.[0]?.itemBought || 'items');
      
      let inactiveDays = 15;
      if (cust.lastOrderDate) {
        const diffTime = Math.abs(new Date().getTime() - new Date(cust.lastOrderDate).getTime());
        inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      msg = msg.replace(/\{\{inactiveDays\}\}/gi, inactiveDays.toString());
      return msg;
    })(),
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
      getCustomersList: () => [] as Customer[],
      getSegmentsList: () => [] as Segment[],
      getCampaignsList: () => [] as Campaign[],
      getLogsList: () => [] as CampaignLog[],
      saveCustomers: (list: Customer[]) => {},
      saveCampaigns: (list: Campaign[]) => {},
      getCustomers: async () => ({ databaseMode: 'Vercel Sandbox', count: 0, customers: [] }),
      seedCustomers: async () => ({ message: 'Mock reset complete' }),
      getSegments: async () => [],
      createSegment: async (data: any) => data,
      getCampaigns: async () => [],
      createCampaign: async (data: any) => data,
      sendCampaign: async () => ({ message: 'Simulating...', audienceSize: 0 }),
      getCampaignDetails: async (id: string) => ({ campaign: {} as any, logs: [] }),
      getCampaignLogs: async (customerId?: string) => [],
      triggerStatusCallback: async () => {},
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

  const resetLocalStoreToDefaults = () => {
    localStorage.setItem('xeno_customers', JSON.stringify(defaultCustomersMock));
    localStorage.setItem('xeno_segments', JSON.stringify(defaultSegmentsMock));
    localStorage.setItem('xeno_campaigns', JSON.stringify(defaultCampaignsMock));
    localStorage.setItem('xeno_logs', JSON.stringify(defaultLogsMock));
  };

  const getCustomersList = (): Customer[] => getOrInit('xeno_customers', defaultCustomersMock);
  const getSegmentsList = (): Segment[] => getOrInit('xeno_segments', defaultSegmentsMock);
  const getCampaignsList = (): Campaign[] => getOrInit('xeno_campaigns', defaultCampaignsMock);
  
  const getLogsList = (): CampaignLog[] => {
    const logs = getOrInit('xeno_logs', defaultLogsMock);
    const customers = getCustomersList();
    if (logs.length > 0 && customers.length > 0) {
      const customerIds = new Set(customers.map(c => c._id));
      const hasAnyMatch = logs.some((l: any) => customerIds.has(l.customerId));
      if (!hasAnyMatch) {
        console.warn("[Sandbox Self-Healing] Customer IDs and Campaign Log IDs are completely disjoint. Resetting local store to defaults.");
        resetLocalStoreToDefaults();
        return defaultLogsMock;
      }
    }
    return logs;
  };

  const saveCustomers = (list: Customer[]) => localStorage.setItem('xeno_customers', JSON.stringify(list));
  const saveSegments = (list: Segment[]) => localStorage.setItem('xeno_segments', JSON.stringify(list));
  const saveCampaigns = (list: Campaign[]) => localStorage.setItem('xeno_campaigns', JSON.stringify(list));

  return {
    getCustomersList,
    getSegmentsList,
    getCampaignsList,
    getLogsList,
    saveCustomers,
    saveCampaigns,
    getCustomers: async () => {
      const list = getCustomersList();
      return { databaseMode: 'Vercel Sandbox', count: list.length, customers: list };
    },
    
    seedCustomers: async () => {
      localStorage.setItem('xeno_customers', JSON.stringify(defaultCustomersMock));
      localStorage.setItem('xeno_segments', JSON.stringify(defaultSegmentsMock));
      localStorage.setItem('xeno_campaigns', JSON.stringify(defaultCampaignsMock));
      localStorage.setItem('xeno_logs', JSON.stringify(defaultLogsMock));
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
        convertedCount: 0,
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

    getCampaignLogs: async (customerId?: string) => {
      const logs = getLogsList();
      if (customerId) {
        return logs.filter(l => l.customerId === customerId);
      }
      return logs;
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
      campaign.convertedCount = 0;
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
      let totalConverted = 0;
      
      campaigns.forEach(c => {
        totalSent += c.sentCount || 0;
        totalDelivered += c.deliveredCount || 0;
        totalOpened += c.openedCount || 0;
        totalClicked += c.clickedCount || 0;
        totalFailed += c.failedCount || 0;
        totalConverted += c.convertedCount || 0;
      });

      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

      // Extract and group all customer orders to build a dynamic timeline
      const allOrders: any[] = [];
      customers.forEach(c => {
        if (c.orders) {
          c.orders.forEach(o => {
            allOrders.push(o);
          });
        }
      });
      // Sort orders chronologically
      allOrders.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
      
      const timelineMap: Record<string, number> = {};
      allOrders.forEach(o => {
        const date = new Date(o.orderDate);
        const monthStr = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g., "Jun 2026"
        timelineMap[monthStr] = (timelineMap[monthStr] || 0) + o.price;
      });
      
      let timeline = Object.keys(timelineMap).map(month => ({
        month,
        revenue: timelineMap[month]
      }));
      
      if (timeline.length === 0) {
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
        timeline = [{ month: currentMonth, revenue: 0 }];
      }

      // Group top cities dynamically
      const cityCounts: Record<string, number> = {};
      customers.forEach(c => {
        const city = c.city || 'Delhi';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      const topCities = Object.keys(cityCounts)
        .map(city => ({ city, count: cityCounts[city] }))
        .sort((a, b) => b.count - a.count);

      return {
        customerCount: customers.length,
        campaignCount: campaigns.length,
        segmentCount: segments.length,
        totalRevenue: totalRev,
        revenueTimeline: timeline,
        topCities: topCities,
        metrics: {
          sent: totalSent,
          delivered: totalDelivered,
          opened: totalOpened,
          clicked: totalClicked,
          failed: totalFailed,
          converted: totalConverted,
          openRate: Math.round(openRate),
          clickRate: Math.round(clickRate),
          deliveryRate: Math.round(deliveryRate),
          conversionRate: Math.round(conversionRate)
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

  getCampaignLogs: async (customerId?: string): Promise<CampaignLog[]> => {
    try {
      const url = customerId ? `${BASE_URL}/logs?customerId=${customerId}` : `${BASE_URL}/logs`;
      const res = await fetchWithFallback(url);
      if (!res.ok) throw new Error('Failed to fetch campaign logs');
      return await res.json();
    } catch (err) {
      return getMockStore().getCampaignLogs(customerId);
    }
  },

  triggerStatusCallback: async (campaignId: string, customerId: string, status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted'): Promise<void> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/campaigns/${campaignId}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status })
      });
      if (!res.ok) throw new Error('Failed to post callback');
    } catch (err) {
      // Standalone fallback: update localStorage directly
      const getLogs = (): CampaignLog[] => {
        const stored = localStorage.getItem('xeno_logs');
        return stored ? JSON.parse(stored) : [];
      };
      const saveLogs = (list: CampaignLog[]) => localStorage.setItem('xeno_logs', JSON.stringify(list));
      
      const getCampaigns = (): Campaign[] => {
        const stored = localStorage.getItem('xeno_campaigns');
        return stored ? JSON.parse(stored) : [];
      };
      const saveCampaigns = (list: Campaign[]) => localStorage.setItem('xeno_campaigns', JSON.stringify(list));

      const logsList = getLogs();
      const log = logsList.find(l => l.campaignId === campaignId && l.customerId === customerId);
      if (log && log.status !== status) {
        log.status = status;
        log.updatedAt = new Date().toISOString();
        saveLogs(logsList);

        // Update campaign counts
        const campaigns = getCampaigns();
        const camp = campaigns.find(c => c._id === campaignId);
        if (camp) {
          if (status === 'delivered') camp.deliveredCount = (camp.deliveredCount || 0) + 1;
          if (status === 'failed') camp.failedCount = (camp.failedCount || 0) + 1;
          if (status === 'opened') camp.openedCount = (camp.openedCount || 0) + 1;
          if (status === 'clicked') camp.clickedCount = (camp.clickedCount || 0) + 1;
          if (status === 'converted') camp.convertedCount = (camp.convertedCount || 0) + 1;
          
          const totalProcessed = (camp.deliveredCount || 0) + (camp.failedCount || 0);
          if (totalProcessed >= camp.audienceSize) {
            camp.status = 'Completed';
          }
          saveCampaigns(campaigns);
        }
      }
    }
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      return await res.json();
    } catch (err) {
      // Standalone fallback
      const list = getMockStore().getCustomersList();
      const newCust: Customer = {
        _id: `mock_cust_${Date.now()}`,
        name: customerData.name || 'Unnamed Customer',
        email: customerData.email || '',
        phone: customerData.phone || '',
        city: customerData.city || 'Delhi',
        totalSpend: 0,
        lastOrderDate: null,
        createdAt: new Date().toISOString()
      };
      list.push(newCust);
      localStorage.setItem('xeno_customers', JSON.stringify(list));
      return newCust;
    }
  },

  createOrder: async (orderData: { customerId: string; itemBought: string; price: number; quantity?: number; campaignId?: string }): Promise<any> => {
    try {
      const res = await fetchWithFallback(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return await res.json();
    } catch (err) {
      // Standalone fallback: update localStorage customer spend and campaign attribution
      const getLogs = (): CampaignLog[] => {
        const stored = localStorage.getItem('xeno_logs');
        return stored ? JSON.parse(stored) : [];
      };
      const saveLogs = (list: CampaignLog[]) => localStorage.setItem('xeno_logs', JSON.stringify(list));
      
      const getCampaigns = (): Campaign[] => {
        const stored = localStorage.getItem('xeno_campaigns');
        return stored ? JSON.parse(stored) : [];
      };
      const saveCampaigns = (list: Campaign[]) => localStorage.setItem('xeno_campaigns', JSON.stringify(list));

      const getCustomers = (): Customer[] => {
        const stored = localStorage.getItem('xeno_customers');
        return stored ? JSON.parse(stored) : [];
      };
      const saveCustomers = (list: Customer[]) => localStorage.setItem('xeno_customers', JSON.stringify(list));

      const customers = getCustomers();
      const customer = customers.find(c => c._id === orderData.customerId);
      const spend = orderData.price * (orderData.quantity || 1);
      
      if (customer) {
        customer.totalSpend = (customer.totalSpend || 0) + spend;
        customer.lastOrderDate = new Date().toISOString();
        saveCustomers(customers);
      }

      let campaignId = orderData.campaignId;
      if (!campaignId) {
        // Find most recent clicked/opened campaign log
        const logs = getLogs();
        const activeClickedLogs = logs
          .filter(l => l.customerId === orderData.customerId && (l.status === 'clicked' || l.status === 'opened'))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (activeClickedLogs.length > 0) {
          campaignId = activeClickedLogs[0].campaignId;
        }
      }

      if (campaignId) {
        const logsList = getLogs();
        const log = logsList.find(l => l.campaignId === campaignId && l.customerId === orderData.customerId);
        if (log && log.status !== 'converted') {
          log.status = 'converted';
          log.updatedAt = new Date().toISOString();
          saveLogs(logsList);

          const campaignsList = getCampaigns();
          const camp = campaignsList.find(c => c._id === campaignId);
          if (camp) {
            camp.convertedCount = (camp.convertedCount || 0) + 1;
            saveCampaigns(campaignsList);
          }
        }
      }

      return { success: true, attributedCampaignId: campaignId || null };
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

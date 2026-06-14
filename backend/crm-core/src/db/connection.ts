import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// --- DATA ACCESS INTERFACES ---
export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string; // Indian city location (e.g. Bangalore, Hyderabad, Delhi)
  totalSpend: number;
  lastOrderDate: string | null;
  createdAt: string;
}

export interface IOrder {
  _id: string;
  customerId: string;
  itemBought: string;
  price: number;
  quantity: number;
  orderDate: string;
}

export interface ISegment {
  _id: string;
  name: string;
  description: string;
  audienceCriteria: {
    totalSpendMin?: number;
    lastOrderDaysAgo?: number;
    specificProduct?: string;
  };
  audienceSize: number;
  createdAt: string;
}

export interface ICampaign {
  _id: string;
  name: string;
  description: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  audienceCriteria: {
    totalSpendMin?: number;
    lastOrderDaysAgo?: number;
    specificProduct?: string;
  };
  audienceSize: number;
  status: 'Draft' | 'Running' | 'Completed';
  messageTemplate: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  convertedCount: number; // Attribution Conversion Count
  createdAt: string;
}

export interface ICampaignLog {
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

// --- MONGOOSE SCHEMAS ---
const MongooseCustomerSchema = new mongoose.Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, default: 'Delhi' },
  totalSpend: { type: Number, default: 0 },
  lastOrderDate: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const MongooseOrderSchema = new mongoose.Schema<IOrder>({
  customerId: { type: String, required: true },
  itemBought: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  orderDate: { type: String, default: () => new Date().toISOString() }
});

const MongooseSegmentSchema = new mongoose.Schema<ISegment>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  audienceCriteria: { type: Object, default: {} },
  audienceSize: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const MongooseCampaignSchema = new mongoose.Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  channel: { type: String, enum: ['Email', 'WhatsApp', 'SMS'], required: true },
  audienceCriteria: { type: Object, default: {} },
  audienceSize: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' },
  messageTemplate: { type: String, required: true },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  openedCount: { type: Number, default: 0 },
  clickedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  convertedCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const MongooseCampaignLogSchema = new mongoose.Schema<ICampaignLog>({
  campaignId: { type: String, required: true },
  customerId: { type: String, required: true },
  recipientDetails: {
    name: String,
    email: String,
    phone: String
  },
  customMessage: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'failed', 'opened', 'clicked', 'converted'], default: 'sent' },
  sentAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

// Models for Mongoose
let CustomerModel: mongoose.Model<ICustomer>;
let OrderModel: mongoose.Model<IOrder>;
let SegmentModel: mongoose.Model<ISegment>;
let CampaignModel: mongoose.Model<ICampaign>;
let CampaignLogModel: mongoose.Model<ICampaignLog>;

try {
  CustomerModel = mongoose.model<ICustomer>('Customer', MongooseCustomerSchema);
  OrderModel = mongoose.model<IOrder>('Order', MongooseOrderSchema);
  SegmentModel = mongoose.model<ISegment>('Segment', MongooseSegmentSchema);
  CampaignModel = mongoose.model<ICampaign>('Campaign', MongooseCampaignSchema);
  CampaignLogModel = mongoose.model<ICampaignLog>('CampaignLog', MongooseCampaignLogSchema);
} catch (e) {
  CustomerModel = mongoose.models.Customer as mongoose.Model<ICustomer>;
  OrderModel = mongoose.models.Order as mongoose.Model<IOrder>;
  SegmentModel = mongoose.models.Segment as mongoose.Model<ISegment>;
  CampaignModel = mongoose.models.Campaign as mongoose.Model<ICampaign>;
  CampaignLogModel = mongoose.models.CampaignLog as mongoose.Model<ICampaignLog>;
}

// --- LOCAL JSON FILE DATABASE (FALLBACK ENGINE) ---
const DATASTORE_PATH = path.join(__dirname, '../../datastore.json');

class JSONStore {
  private data: {
    customers: ICustomer[];
    orders: IOrder[];
    segments: ISegment[];
    campaigns: ICampaign[];
    campaignLogs: ICampaignLog[];
  };

  constructor() {
    this.data = { customers: [], orders: [], segments: [], campaigns: [], campaignLogs: [] };
    this.load();
  }

  private load() {
    if (fs.existsSync(DATASTORE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DATASTORE_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure new array elements exist
        if (!this.data.segments) this.data.segments = [];
      } catch (err) {
        console.error('[JSONDB] Error loading datastore.json, initializing empty data.', err);
      }
    } else {
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DATASTORE_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[JSONDB] Error writing to datastore.json', err);
    }
  }

  // Customers Repo
  get customers() {
    return {
      find: async (query?: any): Promise<ICustomer[]> => {
        let results = [...this.data.customers];
        if (query) {
          if (query._id) results = results.filter(c => c._id === query._id);
          if (query.email) results = results.filter(c => c.email === query.email);
          if (query.city) results = results.filter(c => c.city === query.city);
        }
        return results;
      },
      findById: async (id: string): Promise<ICustomer | null> => {
        return this.data.customers.find(c => c._id === id) || null;
      },
      create: async (doc: Partial<ICustomer>): Promise<ICustomer> => {
        const newDoc: ICustomer = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: doc.name || 'Unknown',
          email: doc.email || '',
          phone: doc.phone || '',
          city: doc.city || 'Delhi',
          totalSpend: doc.totalSpend || 0,
          lastOrderDate: doc.lastOrderDate || null,
          createdAt: doc.createdAt || new Date().toISOString(),
        };
        this.data.customers.push(newDoc);
        this.save();
        return newDoc;
      },
      updateManySpendAndLastOrder: async (customerId: string, spend: number, orderDate: string) => {
        const cust = this.data.customers.find(c => c._id === customerId);
        if (cust) {
          cust.totalSpend += spend;
          cust.lastOrderDate = orderDate;
          this.save();
        }
      },
      clear: async () => {
        this.data.customers = [];
        this.save();
      }
    };
  }

  // Orders Repo
  get orders() {
    return {
      find: async (query?: any): Promise<IOrder[]> => {
        let results = [...this.data.orders];
        if (query) {
          if (query.customerId) results = results.filter(o => o.customerId === query.customerId);
        }
        return results;
      },
      create: async (doc: Partial<IOrder>): Promise<IOrder> => {
        const newDoc: IOrder = {
          _id: new mongoose.Types.ObjectId().toString(),
          customerId: doc.customerId || '',
          itemBought: doc.itemBought || '',
          price: doc.price || 0,
          quantity: doc.quantity || 1,
          orderDate: doc.orderDate || new Date().toISOString(),
        };
        this.data.orders.push(newDoc);
        this.save();
        return newDoc;
      },
      clear: async () => {
        this.data.orders = [];
        this.save();
      }
    };
  }

  // Segments Repo
  get segments() {
    return {
      find: async (): Promise<ISegment[]> => {
        return this.data.segments || [];
      },
      create: async (doc: Partial<ISegment>): Promise<ISegment> => {
        const newDoc: ISegment = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: doc.name || 'New Segment',
          description: doc.description || '',
          audienceCriteria: doc.audienceCriteria || {},
          audienceSize: doc.audienceSize || 0,
          createdAt: new Date().toISOString()
        };
        if (!this.data.segments) this.data.segments = [];
        this.data.segments.push(newDoc);
        this.save();
        return newDoc;
      },
      clear: async () => {
        this.data.segments = [];
        this.save();
      }
    };
  }

  // Campaigns Repo
  get campaigns() {
    return {
      find: async (): Promise<ICampaign[]> => {
        return this.data.campaigns;
      },
      findById: async (id: string): Promise<ICampaign | null> => {
        return this.data.campaigns.find(c => c._id === id) || null;
      },
      create: async (doc: Partial<ICampaign>): Promise<ICampaign> => {
        const newDoc: ICampaign = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: doc.name || 'New Campaign',
          description: doc.description || '',
          channel: doc.channel || 'Email',
          audienceCriteria: doc.audienceCriteria || {},
          audienceSize: doc.audienceSize || 0,
          status: doc.status || 'Draft',
          messageTemplate: doc.messageTemplate || '',
          sentCount: 0,
          deliveredCount: 0,
          openedCount: 0,
          clickedCount: 0,
          failedCount: 0,
          convertedCount: 0,
          createdAt: new Date().toISOString(),
        };
        this.data.campaigns.push(newDoc);
        this.save();
        return newDoc;
      },
      update: async (id: string, updates: Partial<ICampaign>): Promise<ICampaign | null> => {
        const camp = this.data.campaigns.find(c => c._id === id);
        if (!camp) return null;
        Object.assign(camp, updates);
        this.save();
        return camp;
      },
      incrementMetric: async (id: string, metric: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount' | 'convertedCount') => {
        const camp = this.data.campaigns.find(c => c._id === id);
        if (camp) {
          camp[metric] = (camp[metric] || 0) + 1;
          this.save();
        }
      },
      clear: async () => {
        this.data.campaigns = [];
        this.save();
      }
    };
  }

  // CampaignLogs Repo
  get campaignLogs() {
    return {
      find: async (query?: any): Promise<ICampaignLog[]> => {
        let results = [...this.data.campaignLogs];
        if (query) {
          if (query.campaignId) results = results.filter(l => l.campaignId === query.campaignId);
          if (query.customerId) results = results.filter(l => l.customerId === query.customerId);
        }
        return results;
      },
      create: async (doc: Partial<ICampaignLog>): Promise<ICampaignLog> => {
        const newDoc: ICampaignLog = {
          _id: new mongoose.Types.ObjectId().toString(),
          campaignId: doc.campaignId || '',
          customerId: doc.customerId || '',
          recipientDetails: doc.recipientDetails || { name: '', email: '', phone: '' },
          customMessage: doc.customMessage || '',
          status: doc.status || 'sent',
          sentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.campaignLogs.push(newDoc);
        this.save();
        return newDoc;
      },
      updateStatus: async (campaignId: string, customerId: string, status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted'): Promise<ICampaignLog | null> => {
        const log = this.data.campaignLogs.find(l => l.campaignId === campaignId && l.customerId === customerId);
        if (!log) return null;
        log.status = status;
        log.updatedAt = new Date().toISOString();
        this.save();
        return log;
      },
      clear: async () => {
        this.data.campaignLogs = [];
        this.save();
      }
    };
  }
}

const localStore = new JSONStore();

// --- DATABASE REPOSITORY BRIDGE ---
export let isConnectedToMongo = false;

export const db = {
  // Customers Repo
  customers: {
    find: async (query?: any): Promise<ICustomer[]> => {
      if (isConnectedToMongo) {
        return await CustomerModel.find(query).lean();
      }
      return await localStore.customers.find(query);
    },
    findById: async (id: string): Promise<ICustomer | null> => {
      if (isConnectedToMongo) {
        return await CustomerModel.findById(id).lean();
      }
      return await localStore.customers.findById(id);
    },
    create: async (doc: Partial<ICustomer>): Promise<ICustomer> => {
      if (isConnectedToMongo) {
        const newDoc = await CustomerModel.create(doc);
        return newDoc.toObject();
      }
      return await localStore.customers.create(doc);
    },
    updateSpendAndLastOrder: async (customerId: string, spend: number, orderDate: string): Promise<void> => {
      if (isConnectedToMongo) {
        await CustomerModel.findByIdAndUpdate(customerId, {
          $inc: { totalSpend: spend },
          $set: { lastOrderDate: orderDate }
        });
      } else {
        await localStore.customers.updateManySpendAndLastOrder(customerId, spend, orderDate);
      }
    },
    clear: async (): Promise<void> => {
      if (isConnectedToMongo) {
        await CustomerModel.deleteMany({});
      } else {
        await localStore.customers.clear();
      }
    }
  },

  // Orders Repo
  orders: {
    find: async (query?: any): Promise<IOrder[]> => {
      if (isConnectedToMongo) {
        return await OrderModel.find(query).lean();
      }
      return await localStore.orders.find(query);
    },
    create: async (doc: Partial<IOrder>): Promise<IOrder> => {
      if (isConnectedToMongo) {
        const newDoc = await OrderModel.create(doc);
        await db.customers.updateSpendAndLastOrder(doc.customerId!, doc.price! * (doc.quantity || 1), doc.orderDate || new Date().toISOString());
        return newDoc.toObject();
      }
      const order = await localStore.orders.create(doc);
      await db.customers.updateSpendAndLastOrder(doc.customerId!, doc.price! * (doc.quantity || 1), doc.orderDate || new Date().toISOString());
      return order;
    },
    clear: async (): Promise<void> => {
      if (isConnectedToMongo) {
        await OrderModel.deleteMany({});
      } else {
        await localStore.orders.clear();
      }
    }
  },

  // Segments Repo
  segments: {
    find: async (): Promise<ISegment[]> => {
      if (isConnectedToMongo) {
        return await SegmentModel.find().sort({ createdAt: -1 }).lean();
      }
      return await localStore.segments.find();
    },
    create: async (doc: Partial<ISegment>): Promise<ISegment> => {
      if (isConnectedToMongo) {
        const newDoc = await SegmentModel.create(doc);
        return newDoc.toObject();
      }
      return await localStore.segments.create(doc);
    },
    clear: async (): Promise<void> => {
      if (isConnectedToMongo) {
        await SegmentModel.deleteMany({});
      } else {
        await localStore.segments.clear();
      }
    }
  },

  // Campaigns Repo
  campaigns: {
    find: async (): Promise<ICampaign[]> => {
      if (isConnectedToMongo) {
        return await CampaignModel.find().sort({ createdAt: -1 }).lean();
      }
      return await localStore.campaigns.find();
    },
    findById: async (id: string): Promise<ICampaign | null> => {
      if (isConnectedToMongo) {
        return await CampaignModel.findById(id).lean();
      }
      return await localStore.campaigns.findById(id);
    },
    create: async (doc: Partial<ICampaign>): Promise<ICampaign> => {
      if (isConnectedToMongo) {
        const newDoc = await CampaignModel.create(doc);
        return newDoc.toObject();
      }
      return await localStore.campaigns.create(doc);
    },
    update: async (id: string, updates: Partial<ICampaign>): Promise<ICampaign | null> => {
      if (isConnectedToMongo) {
        return await CampaignModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      return await localStore.campaigns.update(id, updates);
    },
    incrementMetric: async (id: string, metric: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount' | 'convertedCount'): Promise<void> => {
      if (isConnectedToMongo) {
        await CampaignModel.findByIdAndUpdate(id, { $inc: { [metric]: 1 } });
      } else {
        await localStore.campaigns.incrementMetric(id, metric);
      }
    },
    clear: async (): Promise<void> => {
      if (isConnectedToMongo) {
        await CampaignModel.deleteMany({});
      } else {
        await localStore.campaigns.clear();
      }
    }
  },

  // CampaignLogs Repo
  campaignLogs: {
    find: async (query?: any): Promise<ICampaignLog[]> => {
      if (isConnectedToMongo) {
        return await CampaignLogModel.find(query).lean();
      }
      return await localStore.campaignLogs.find(query);
    },
    create: async (doc: Partial<ICampaignLog>): Promise<ICampaignLog> => {
      if (isConnectedToMongo) {
        const newDoc = await CampaignLogModel.create(doc);
        return newDoc.toObject();
      }
      return await localStore.campaignLogs.create(doc);
    },
    updateStatus: async (campaignId: string, customerId: string, status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted'): Promise<ICampaignLog | null> => {
      if (isConnectedToMongo) {
        return await CampaignLogModel.findOneAndUpdate(
          { campaignId, customerId },
          { $set: { status, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
      }
      return await localStore.campaignLogs.updateStatus(campaignId, customerId, status);
    },
    clear: async (): Promise<void> => {
      if (isConnectedToMongo && CampaignLogModel) {
        await CampaignLogModel.deleteMany({});
      } else {
        await localStore.campaignLogs.clear();
      }
    }
  }
};

// --- INITIALIZATION ---
async function proactiveSeed() {
  try {
    const list = await db.customers.find();
    if (list.length > 0) return;
    
    console.log('🌱 [DB] Customer database is empty. Proactively seeding mock customers to prevent empty segments...');
    
    const seedData = [
      { _id: '6a2c1dea5c02c79f78f35416', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+919876543210', city: 'Bangalore', lastOrderDays: 45, orders: [{ item: 'Cappuccino', price: 250 }, { item: 'Chocolate Muffin', price: 180 }] },
      { _id: '6a2c1dea5c02c79f78f35419', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+919123456789', city: 'Hyderabad', lastOrderDays: 1, orders: [{ item: 'Cold Brew Coffee', price: 220 }, { item: 'Avocado Toast', price: 350 }] },
      { _id: '6a2c1dea5c02c79f78f3541c', name: 'Aman Verma', email: 'aman.verma@example.com', phone: '+918888888888', city: 'Lucknow', lastOrderDays: 50, orders: [{ item: 'Air Jordan Sneakers', price: 9500 }] },
      { _id: '6a2c1dea5c02c79f78f3541e', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+917777777777', city: 'Chandigarh', lastOrderDays: 12, orders: [{ item: 'Latte', price: 280 }] },
      { _id: '6a2c1dea5c02c79f78f35420', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+919999999999', city: 'Delhi', lastOrderDays: 90, orders: [{ item: 'Nike Pegasus Running Shoes', price: 7500 }] },
      
      { _id: '6a2c1dea5c02c79f78f35422', name: 'Ananya Sen', email: 'ananya.sen@example.com', phone: '+919444455555', city: 'Bangalore', lastOrderDays: 3, orders: [{ item: 'Espresso Macchiato', price: 210 }, { item: 'Croissant', price: 150 }] },
      { _id: '6a2c1dea5c02c79f78f35425', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+918222233333', city: 'Hyderabad', lastOrderDays: 32, orders: [{ item: 'Adidas Ultrboost Sneakers', price: 8900 }] },
      { _id: '6a2c1dea5c02c79f78f35427', name: 'Meera Joshi', email: 'meera.joshi@example.com', phone: '+919111122222', city: 'Lucknow', lastOrderDays: 15, orders: [{ item: 'Filter Coffee', price: 120 }, { item: 'Paneer Puff', price: 80 }] },
      { _id: '6a2c1dea5c02c79f78f3542a', name: 'Kabir Malhotra', email: 'kabir.m@example.com', phone: '+919555566666', city: 'Chandigarh', lastOrderDays: 60, orders: [{ item: 'Iced Latte', price: 260 }] },
      { _id: '6a2c1dea5c02c79f78f3542c', name: 'Zara Khan', email: 'zara.khan@example.com', phone: '+919666677777', city: 'Delhi', lastOrderDays: 2, orders: [{ item: 'Puma Suede Sneakers', price: 4500 }] },
      
      { _id: '6a2c1dea5c02c79f78f3542e', name: 'Aditya Rao', email: 'aditya.rao@example.com', phone: '+919777788888', city: 'Bangalore', lastOrderDays: 25, orders: [{ item: 'Cappuccino', price: 250 }] },
      { _id: '6a2c1dea5c02c79f78f35430', name: 'Divya Nair', email: 'divya.nair@example.com', phone: '+919888899999', city: 'Hyderabad', lastOrderDays: 120, orders: [{ item: 'Cold Brew Coffee', price: 220 }] },
      { _id: '6a2c1dea5c02c79f78f35432', name: 'Siddharth Roy', email: 'sid.roy@example.com', phone: '+919000011111', city: 'Lucknow', lastOrderDays: 5, orders: [{ item: 'Nike Pegasus Running Shoes', price: 7500 }, { item: 'Socks Pack', price: 600 }] },
      { _id: '6a2c1dea5c02c79f78f35435', name: 'Tanvi Shah', email: 'tanvi.shah@example.com', phone: '+919111133333', city: 'Chandigarh', lastOrderDays: 70, orders: [{ item: 'Latte', price: 280 }] },
      { _id: '6a2c1dea5c02c79f78f35437', name: 'Varun Das', email: 'varun.das@example.com', phone: '+919222244444', city: 'Delhi', lastOrderDays: 8, orders: [{ item: 'Filter Coffee', price: 120 }] },

      { _id: '6a2c1dea5c02c79f78f35439', name: 'Karthik Raja', email: 'karthik.r@example.com', phone: '+919000122222', city: 'Bangalore', lastOrderDays: 10, orders: [{ item: 'Latte', price: 280 }] },
      { _id: '6a2c1dea5c02c79f78f3543b', name: 'Megha Rao', email: 'megha.r@example.com', phone: '+919000133333', city: 'Bangalore', lastOrderDays: 4, orders: [{ item: 'Espresso', price: 180 }] },
      { _id: '6a2c1dea5c02c79f78f3543d', name: 'Suresh Kumar', email: 'suresh.k@example.com', phone: '+919000144444', city: 'Bangalore', lastOrderDays: 20, orders: [{ item: 'Filter Coffee', price: 120 }] },
      { _id: '6a2c1dea5c02c79f78f3543f', name: 'Lata Mangesh', email: 'lata.m@example.com', phone: '+919000155555', city: 'Hyderabad', lastOrderDays: 33, orders: [{ item: 'Cappuccino', price: 250 }] },
      { _id: '6a2c1dea5c02c79f78f35441', name: 'Harish Kalyan', email: 'harish.k@example.com', phone: '+919000166666', city: 'Delhi', lastOrderDays: 4, orders: [{ item: 'Cold Brew Coffee', price: 220 }] }
    ];
    
    const now = new Date();
    const daysAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d.toISOString();
    };

    for (const item of seedData) {
      const cust = await db.customers.create({
        _id: item._id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        city: item.city,
        totalSpend: 0,
        lastOrderDate: null,
      });

      const orderDate = daysAgo(item.lastOrderDays);
      for (const order of item.orders) {
        await db.orders.create({
          customerId: cust._id,
          itemBought: order.item,
          price: order.price,
          quantity: 1,
          orderDate: orderDate
        });
      }
    }
    
    // Seed default segments
    await db.segments.create({
      name: 'Coffee Winback Segment',
      description: 'Shoppers who bought coffee items and spent over ₹500 but are inactive for 30+ days',
      audienceCriteria: { totalSpendMin: 500, lastOrderDaysAgo: 30 },
      audienceSize: 2
    });

    await db.segments.create({
      name: 'Premium Sneaker VIPs',
      description: 'High-value shoppers who spent above ₹5000 on premium footwear',
      audienceCriteria: { totalSpendMin: 5000 },
      audienceSize: 3
    });

    // Clear and seed campaigns
    await db.campaigns.clear();
    await db.campaigns.create({
      _id: '6a2c3a785c02c79f78f3544b',
      name: 'Premium Sneaker VIP Launch 👟',
      description: 'Re-engaging premium fashion consumers via visually rich email marketing showcasing sneaker stock updates.',
      channel: 'Email',
      audienceCriteria: { specificProduct: 'Sneakers', totalSpendMin: 5000 },
      audienceSize: 3,
      status: 'Completed',
      messageTemplate: 'Subject: Exclusive 15% VIP Discount on Sneakers! 👟\n\nDear {{name}},\n\nYour shoe game deserves the best. We noticed you previously bought {{lastProduct}} from Xeno. We just restocked some premium sneakers and wanted to offer you an exclusive 15% off.\n\nUse code SNEAKER15 to upgrade your style. Total spend to date: ₹{{totalSpend}}.',
      sentCount: 3,
      deliveredCount: 3,
      openedCount: 2,
      clickedCount: 1,
      failedCount: 0,
      convertedCount: 1
    });

    await db.campaigns.create({
      _id: '6a2c1e785c02c79f78f35445',
      name: 'Coffee Lovers Re-activation ☕',
      description: 'Targeting previous coffee customers with high open-rate WhatsApp channels to drive instant caffeine craving re-activation.',
      channel: 'WhatsApp',
      audienceCriteria: { specificProduct: 'Coffee', totalSpendMin: 500 },
      audienceSize: 2,
      status: 'Completed',
      messageTemplate: 'Hey {{name}}! ☕ We noticed it has been {{inactiveDays}} days since your last order of {{lastProduct}}! We miss brewing for you. Here is a flat 20% discount on your next visit. Use code BREW20 at checkout! Let us catch up soon!',
      sentCount: 2,
      deliveredCount: 2,
      openedCount: 2,
      clickedCount: 1,
      failedCount: 0,
      convertedCount: 0
    });

    // Clear and seed campaign logs
    await db.campaignLogs.clear();
    
    // Aman Verma sneaker log (Email) - Converted
    await db.campaignLogs.create({
      campaignId: '6a2c3a785c02c79f78f3544b',
      customerId: '6a2c1dea5c02c79f78f3541c',
      recipientDetails: { name: 'Aman Verma', email: 'aman.verma@example.com', phone: '+918888888888' },
      customMessage: 'Subject: Exclusive 15% VIP Discount on Sneakers! 👟\n\nDear Aman Verma,\n\nYour shoe game deserves the best. We noticed you previously bought Air Jordan Sneakers from Xeno. We just restocked some premium sneakers and wanted to offer you an exclusive 15% off.\n\nUse code SNEAKER15 to upgrade your style. Total spend to date: ₹9500.',
      status: 'converted',
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    });

    // Rohan Gupta sneaker log (Email) - Opened
    await db.campaignLogs.create({
      campaignId: '6a2c3a785c02c79f78f3544b',
      customerId: '6a2c1dea5c02c79f78f35425',
      recipientDetails: { name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+918222233333' },
      customMessage: 'Subject: Exclusive 15% VIP Discount on Sneakers! 👟\n\nDear Rohan Gupta,\n\nYour shoe game deserves the best. We noticed you previously bought Adidas Ultraboost Sneakers from Xeno. We just restocked some premium sneakers and wanted to offer you an exclusive 15% off.\n\nUse code SNEAKER15 to upgrade your style. Total spend to date: ₹8900.',
      status: 'opened',
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    // Zara Khan sneaker log (Email) - Delivered
    await db.campaignLogs.create({
      campaignId: '6a2c3a785c02c79f78f3544b',
      customerId: '6a2c1dea5c02c79f78f3542c',
      recipientDetails: { name: 'Zara Khan', email: 'zara.khan@example.com', phone: '+919666677777' },
      customMessage: 'Subject: Exclusive 15% VIP Discount on Sneakers! 👟\n\nDear Zara Khan,\n\nYour shoe game deserves the best. We noticed you previously bought Puma Suede Sneakers from Xeno. We just restocked some premium sneakers and wanted to offer you an exclusive 15% off.\n\nUse code SNEAKER15 to upgrade your style. Total spend to date: ₹4500.',
      status: 'delivered',
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    // Divya Nair coffee log (WhatsApp) - Clicked
    await db.campaignLogs.create({
      campaignId: '6a2c1e785c02c79f78f35445',
      customerId: '6a2c1dea5c02c79f78f35430',
      recipientDetails: { name: 'Divya Nair', email: 'divya.nair@example.com', phone: '+919888899999' },
      customMessage: 'Hey Divya Nair! ☕ We noticed it has been 120 days since your last order of Cold Brew Coffee! We miss brewing for you. Here is a flat 20% discount on your next visit. Use code BREW20 at checkout! Let us catch up soon!',
      status: 'clicked',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString()
    });

    console.log('✅ [DB] Proactive database seeding completed. 20 profiles, 2 segments, 2 campaigns, and 4 logs loaded.');
  } catch (err: any) {
    console.error('❌ [DB] Proactive seeding failed:', err.message);
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/xeno-crm';
  const isProduction = process.env.NODE_ENV === 'production';
  const hasExplicitMongo = !!process.env.MONGO_URI;
  
  // Use a longer timeout in production or when an explicit URI is provided
  const timeoutMs = (isProduction || hasExplicitMongo) ? 15000 : 2000;
  
  console.log(`[DB] Attempting to connect to MongoDB at: ${mongoUri.split('@').pop()} (timeout: ${timeoutMs}ms)...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    isConnectedToMongo = true;
    console.log('💚 [DB] Successfully connected to MongoDB.');
  } catch (error: any) {
    isConnectedToMongo = false;
    console.warn(`💛 [DB] MongoDB connection failed or timed out (${error.message}).`);
    if (isProduction || hasExplicitMongo) {
      console.error('🚨 [DB] CRITICAL: Running in production/configured database mode but failed to connect to remote MongoDB. Fallback JSONDB will be active but local changes will be ephemeral!');
    } else {
      console.warn('⚡ [DB] GRACEFULLY FALLING BACK TO LOCAL FILE SYSTEM STORAGE (datastore.json)');
    }
  }
  
  // Proactively seed if empty
  await proactiveSeed();
}

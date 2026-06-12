import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// --- DATA ACCESS INTERFACES ---
export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
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
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sentAt: string;
  updatedAt: string;
}

// --- MONGOOSE MONGO SCHEMAS ---
const MongooseCustomerSchema = new mongoose.Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
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
  status: { type: String, enum: ['sent', 'delivered', 'failed', 'opened', 'clicked'], default: 'sent' },
  sentAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

// Models for Mongoose
let CustomerModel: mongoose.Model<ICustomer>;
let OrderModel: mongoose.Model<IOrder>;
let CampaignModel: mongoose.Model<ICampaign>;
let CampaignLogModel: mongoose.Model<ICampaignLog>;

try {
  CustomerModel = mongoose.model<ICustomer>('Customer', MongooseCustomerSchema);
  OrderModel = mongoose.model<IOrder>('Order', MongooseOrderSchema);
  CampaignModel = mongoose.model<ICampaign>('Campaign', MongooseCampaignSchema);
  CampaignLogModel = mongoose.model<ICampaignLog>('CampaignLog', MongooseCampaignLogSchema);
} catch (e) {
  CustomerModel = mongoose.models.Customer as mongoose.Model<ICustomer>;
  OrderModel = mongoose.models.Order as mongoose.Model<IOrder>;
  CampaignModel = mongoose.models.Campaign as mongoose.Model<ICampaign>;
  CampaignLogModel = mongoose.models.CampaignLog as mongoose.Model<ICampaignLog>;
}

// --- LOCAL JSON FILE DATABASE (FALLBACK ENGINE) ---
const DATASTORE_PATH = path.join(__dirname, '../../datastore.json');

class JSONStore {
  private data: {
    customers: ICustomer[];
    orders: IOrder[];
    campaigns: ICampaign[];
    campaignLogs: ICampaignLog[];
  };

  constructor() {
    this.data = { customers: [], orders: [], campaigns: [], campaignLogs: [] };
    this.load();
  }

  private load() {
    if (fs.existsSync(DATASTORE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DATASTORE_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
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
      incrementMetric: async (id: string, metric: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount') => {
        const camp = this.data.campaigns.find(c => c._id === id);
        if (camp) {
          camp[metric] = (camp[metric] || 0) + 1;
          this.save();
        }
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
      updateStatus: async (campaignId: string, customerId: string, status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'): Promise<ICampaignLog | null> => {
        const log = this.data.campaignLogs.find(l => l.campaignId === campaignId && l.customerId === customerId);
        if (!log) return null;
        log.status = status;
        log.updatedAt = new Date().toISOString();
        this.save();
        return log;
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
        // Also update customer aggregates
        await db.customers.updateSpendAndLastOrder(doc.customerId!, doc.price! * (doc.quantity || 1), doc.orderDate || new Date().toISOString());
        return newDoc.toObject();
      }
      // For JSON store, update customer aggregates
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
    incrementMetric: async (id: string, metric: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount'): Promise<void> => {
      if (isConnectedToMongo) {
        await CampaignModel.findByIdAndUpdate(id, { $inc: { [metric]: 1 } });
      } else {
        await localStore.campaigns.incrementMetric(id, metric);
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
    updateStatus: async (campaignId: string, customerId: string, status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'): Promise<ICampaignLog | null> => {
      if (isConnectedToMongo) {
        return await CampaignLogModel.findOneAndUpdate(
          { campaignId, customerId },
          { $set: { status, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
      }
      return await localStore.campaignLogs.updateStatus(campaignId, customerId, status);
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
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+919876543210', lastOrderDays: 45, orders: [{ item: 'Cappuccino', price: 250 }, { item: 'Chocolate Muffin', price: 180 }] },
      { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+919123456789', lastOrderDays: 1, orders: [{ item: 'Cold Brew Coffee', price: 220 }, { item: 'Avocado Toast', price: 350 }] },
      { name: 'Aman Verma', email: 'aman.verma@example.com', phone: '+918888888888', lastOrderDays: 50, orders: [{ item: 'Air Jordan Sneakers', price: 9500 }] },
      { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+917777777777', lastOrderDays: 12, orders: [{ item: 'Latte', price: 280 }] },
      { name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+919999999999', lastOrderDays: 90, orders: [{ item: 'Nike Pegasus Running Shoes', price: 7500 }] },
      { name: 'Ananya Sen', email: 'ananya.sen@example.com', phone: '+919444455555', lastOrderDays: 3, orders: [{ item: 'Espresso Macchiato', price: 210 }, { item: 'Croissant', price: 150 }] },
      { name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+918222233333', lastOrderDays: 32, orders: [{ item: 'Adidas Ultraboost Sneakers', price: 8900 }] },
      { name: 'Meera Joshi', email: 'meera.joshi@example.com', phone: '+919111122222', lastOrderDays: 15, orders: [{ item: 'Filter Coffee', price: 120 }, { item: 'Paneer Puff', price: 80 }] },
      { name: 'Kabir Malhotra', email: 'kabir.m@example.com', phone: '+919555566666', lastOrderDays: 60, orders: [{ item: 'Iced Latte', price: 260 }] },
      { name: 'Zara Khan', email: 'zara.khan@example.com', phone: '+919666677777', lastOrderDays: 2, orders: [{ item: 'Puma Suede Sneakers', price: 4500 }] },
      { name: 'Aditya Rao', email: 'aditya.rao@example.com', phone: '+919777788888', lastOrderDays: 25, orders: [{ item: 'Cappuccino', price: 250 }] },
      { name: 'Divya Nair', email: 'divya.nair@example.com', phone: '+919888899999', lastOrderDays: 120, orders: [{ item: 'Cold Brew Coffee', price: 220 }] },
      { name: 'Siddharth Roy', email: 'sid.roy@example.com', phone: '+919000011111', lastOrderDays: 5, orders: [{ item: 'Nike Pegasus Running Shoes', price: 7500 }, { item: 'Socks Pack', price: 600 }] },
      { name: 'Tanvi Shah', email: 'tanvi.shah@example.com', phone: '+919111133333', lastOrderDays: 70, orders: [{ item: 'Latte', price: 280 }] },
      { name: 'Varun Das', email: 'varun.das@example.com', phone: '+919222244444', lastOrderDays: 8, orders: [{ item: 'Filter Coffee', price: 120 }] },
    ];
    
    const now = new Date();
    const daysAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d.toISOString();
    };

    for (const item of seedData) {
      const cust = await db.customers.create({
        name: item.name,
        email: item.email,
        phone: item.phone,
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
    console.log('✅ [DB] Proactive database seeding completed. 15 profiles loaded.');
  } catch (err: any) {
    console.error('❌ [DB] Proactive seeding failed:', err.message);
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/xeno-crm';
  console.log(`[DB] Attempting to connect to MongoDB at: ${mongoUri}...`);

  try {
    // Attempt connection with a short timeout to prevent blocking startup
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000, // Wait 2s before timing out
    });
    isConnectedToMongo = true;
    console.log('💚 [DB] Successfully connected to MongoDB.');
  } catch (error: any) {
    isConnectedToMongo = false;
    console.warn(`💛 [DB] MongoDB connection timed out or failed (${error.message}).`);
    console.warn('⚡ [DB] GRACEFULLY FALLING BACK TO LOCAL FILE SYSTEM STORAGE (datastore.json)');
  }
  
  // Proactively seed if empty
  await proactiveSeed();
}

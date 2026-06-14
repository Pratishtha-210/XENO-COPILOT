import { Router, Request, Response } from 'express';
import { db, isConnectedToMongo } from '../db/connection';
import { aiService } from '../services/aiService';
import { segmentationService } from '../services/segmentationService';
import axios from 'axios';

const router = Router();

const SIMULATOR_URL = process.env.SIMULATOR_URL || 'http://localhost:5001';

// 1. Get all customers with their order history
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const customers = await db.customers.find();
    const customersWithOrders = [];

    for (const customer of customers) {
      const orders = await db.orders.find({ customerId: customer._id });
      customersWithOrders.push({
        ...customer,
        orders
      });
    }

    res.json({
      databaseMode: isConnectedToMongo ? 'MongoDB' : 'JSONDB',
      count: customersWithOrders.length,
      customers: customersWithOrders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Data Seeding Endpoint
router.post('/customers/seed', async (req: Request, res: Response) => {
  try {
    await db.customers.clear();
    await db.orders.clear();
    await db.segments.clear();
    await db.campaigns.clear();
    await db.campaignLogs.clear();

    const now = new Date();
    const daysAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d.toISOString();
    };

    // 20 mock customers with designated cities and static IDs
    const seedData = [
      { _id: '6a2c1dea5c02c79f78f35416', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+919876543210', city: 'Bangalore', lastOrderDays: 45, orders: [{ item: 'Cappuccino', price: 250 }, { item: 'Chocolate Muffin', price: 180 }] },
      { _id: '6a2c1dea5c02c79f78f35419', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+919123456789', city: 'Hyderabad', lastOrderDays: 1, orders: [{ item: 'Cold Brew Coffee', price: 220 }, { item: 'Avocado Toast', price: 350 }] },
      { _id: '6a2c1dea5c02c79f78f3541c', name: 'Aman Verma', email: 'aman.verma@example.com', phone: '+918888888888', city: 'Lucknow', lastOrderDays: 50, orders: [{ item: 'Air Jordan Sneakers', price: 9500 }] },
      { _id: '6a2c1dea5c02c79f78f3541e', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+917777777777', city: 'Chandigarh', lastOrderDays: 12, orders: [{ item: 'Latte', price: 280 }] },
      { _id: '6a2c1dea5c02c79f78f35420', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+919999999999', city: 'Delhi', lastOrderDays: 90, orders: [{ item: 'Nike Pegasus Running Shoes', price: 7500 }] },
      
      { _id: '6a2c1dea5c02c79f78f35422', name: 'Ananya Sen', email: 'ananya.sen@example.com', phone: '+919444455555', city: 'Bangalore', lastOrderDays: 3, orders: [{ item: 'Espresso Macchiato', price: 210 }, { item: 'Croissant', price: 150 }] },
      { _id: '6a2c1dea5c02c79f78f35425', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+918222233333', city: 'Hyderabad', lastOrderDays: 32, orders: [{ item: 'Adidas Ultraboost Sneakers', price: 8900 }] },
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

    // Seed default campaigns
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

    // Seed campaign logs
    
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

    res.json({ message: 'Seed successful. Ingested 20 customers, 2 segments, 2 campaigns, and 4 logs.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. AI NLP Intent Parsing
router.post('/ai/analyze-goal', async (req: Request, res: Response) => {
  const { goal } = req.body;
  if (!goal) {
    return res.status(400).json({ error: 'Goal description is required' });
  }

  try {
    const aiAnalysis = await aiService.analyzeGoal(goal);
    const matchedAudience = await segmentationService.filterCustomers(aiAnalysis.audienceCriteria);

    res.json({
      analysis: aiAnalysis,
      estimatedAudienceSize: matchedAudience.length,
      matchedCustomers: matchedAudience.map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        totalSpend: c.totalSpend,
        lastOrderDate: c.lastOrderDate
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Create Campaign
router.post('/campaigns', async (req: Request, res: Response) => {
  const { name, description, channel, audienceCriteria, messageTemplate, audienceSize } = req.body;

  try {
    const campaign = await db.campaigns.create({
      name,
      description,
      channel,
      audienceCriteria,
      audienceSize,
      messageTemplate,
      status: 'Draft'
    });
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Send Campaign
router.post('/campaigns/:id/send', async (req: Request, res: Response) => {
  const campaignId = req.params.id;

  try {
    const campaign = await db.campaigns.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'Running') {
      return res.status(400).json({ error: 'Campaign is already running' });
    }

    const targetCustomers = await segmentationService.filterCustomers(campaign.audienceCriteria);
    if (targetCustomers.length === 0) {
      await db.campaigns.update(campaignId, { status: 'Draft', audienceSize: 0 });
      return res.status(200).json({
        warning: 'Audience segment is empty. Campaign saved as Draft. Please seed customer data or adjust filter queries.',
        isDraft: true,
        audienceSize: 0
      });
    }

    await db.campaigns.update(campaignId, {
      status: 'Running',
      audienceSize: targetCustomers.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0
    });

    const coreUrl = process.env.CORE_URL || 'http://localhost:5000';
    const callbackUrl = `${coreUrl}/api/campaigns/${campaignId}/callback`;
    const recipientsToSend = [];

    for (const customer of targetCustomers) {
      const orders = await db.orders.find({ customerId: customer._id });
      const customMessage = await aiService.generatePersonalizedMessage(campaign.messageTemplate, customer, orders);

      await db.campaignLogs.create({
        campaignId,
        customerId: customer._id,
        recipientDetails: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        },
        customMessage,
        status: 'sent'
      });

      await db.campaigns.incrementMetric(campaignId, 'sentCount');

      recipientsToSend.push({
        customerId: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customMessage
      });
    }

    try {
      await axios.post(`${SIMULATOR_URL}/api/send`, {
        campaignId,
        callbackUrl,
        channel: campaign.channel,
        recipients: recipientsToSend
      });
    } catch (simError: any) {
      console.error('[CRM Core] Error calling Channel Simulator:', simError.message);
      await db.campaigns.update(campaignId, { status: 'Completed', failedCount: targetCustomers.length });
      return res.status(502).json({
        error: 'Channel Simulator is offline. Campaign aborted.',
        details: simError.message
      });
    }

    res.json({
      message: 'Campaign launched successfully.',
      audienceSize: targetCustomers.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Callback
router.post('/campaigns/:id/callback', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const { customerId, status } = req.body;

  try {
    const logs = await db.campaignLogs.find({ campaignId, customerId });
    const log = logs.length > 0 ? logs[0] : null;

    if (!log) return res.status(404).json({ error: 'Campaign log not found' });
    if (log.status === status) return res.sendStatus(200);

    await db.campaignLogs.updateStatus(campaignId, customerId, status);

    if (status === 'delivered') await db.campaigns.incrementMetric(campaignId, 'deliveredCount');
    if (status === 'failed') await db.campaigns.incrementMetric(campaignId, 'failedCount');
    if (status === 'opened') await db.campaigns.incrementMetric(campaignId, 'openedCount');
    if (status === 'clicked') await db.campaigns.incrementMetric(campaignId, 'clickedCount');

    const campaign = await db.campaigns.findById(campaignId);
    if (campaign) {
      const totalProcessed = campaign.deliveredCount + campaign.failedCount;
      if (totalProcessed >= campaign.audienceSize) {
        await db.campaigns.update(campaignId, { status: 'Completed' });
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Campaigns
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const campaigns = await db.campaigns.find();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaigns/:id', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  try {
    const campaign = await db.campaigns.findById(campaignId);
    const logs = await db.campaignLogs.find({ campaignId });
    res.json({ campaign, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Segments Endpoints
router.get('/segments', async (req: Request, res: Response) => {
  try {
    const list = await db.segments.find();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/segments', async (req: Request, res: Response) => {
  const { name, description, audienceCriteria } = req.body;
  try {
    const matched = await segmentationService.filterCustomers(audienceCriteria);
    const segment = await db.segments.create({
      name,
      description,
      audienceCriteria,
      audienceSize: matched.length
    });
    res.status(201).json(segment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8b. Campaign Logs endpoint
router.get('/logs', async (req: Request, res: Response) => {
  const { customerId } = req.query;
  try {
    const query = customerId ? { customerId: customerId as string } : {};
    const logs = await db.campaignLogs.find(query);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Dashboard Global Analytics Summary (Database-driven)
router.get('/analytics/dashboard', async (req: Request, res: Response) => {
  try {
    const campaigns = await db.campaigns.find();
    const customers = await db.customers.find();
    const segmentsList = await db.segments.find();
    const orders = await db.orders.find();

    const dbCustomerCount = customers.length;
    
    // Group top cities dynamically
    const cityCounts: Record<string, number> = {};
    for (const customer of customers) {
      const city = customer.city || 'Delhi';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }

    const topCitiesData = Object.keys(cityCounts)
      .map(city => ({ city, count: cityCounts[city] }))
      .sort((a, b) => b.count - a.count);

    // Dynamic database revenue calculations
    const dbRevenue = orders.reduce((sum, o) => sum + (o.price * (o.quantity || 1)), 0);

    // Build timeline dynamically from database order dates
    const sortedOrders = [...orders].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    const timelineMap: Record<string, number> = {};
    for (const order of sortedOrders) {
      const date = new Date(order.orderDate);
      const monthStr = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g. "Jun 2026"
      timelineMap[monthStr] = (timelineMap[monthStr] || 0) + (order.price * (order.quantity || 1));
    }
    
    let revenueTimeline = Object.keys(timelineMap).map(month => ({
      month,
      revenue: timelineMap[month]
    }));
    
    if (revenueTimeline.length === 0) {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
      revenueTimeline = [{ month: currentMonth, revenue: 0 }];
    }

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

    res.json({
      customerCount: dbCustomerCount, // Pure database count
      campaignCount: campaigns.length,
      segmentCount: segmentsList.length,
      totalRevenue: dbRevenue, // Pure database sum
      revenueTimeline: revenueTimeline,
      topCities: topCitiesData,
      metrics: {
        sent: totalSent,
        delivered: totalDelivered,
        opened: totalOpened,
        clicked: totalClicked,
        failed: totalFailed,
        converted: totalConverted,
        openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
        clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0,
        deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
        conversionRate: totalSent > 0 ? Math.round((totalConverted / totalSent) * 100) : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Data Ingestion: Create Customer
router.post('/customers', async (req: Request, res: Response) => {
  const { name, email, phone, city } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const customer = await db.customers.create({
      name,
      email,
      phone: phone || '',
      city: city || 'Delhi',
      totalSpend: 0,
      lastOrderDate: null
    });
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Data Ingestion: Create Order & Campaign Attribution
router.post('/orders', async (req: Request, res: Response) => {
  const { customerId, itemBought, price, quantity, campaignId } = req.body;
  if (!customerId || !itemBought || !price) {
    return res.status(400).json({ error: 'customerId, itemBought, and price are required' });
  }

  try {
    const customer = await db.customers.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const qty = quantity ? parseInt(quantity) : 1;
    const itemPrice = parseFloat(price);

    // Create the order (triggers automatic update of customer spend)
    const order = await db.orders.create({
      customerId,
      itemBought,
      price: itemPrice,
      quantity: qty,
      orderDate: new Date().toISOString()
    });

    let attributedCampaignId = campaignId;

    // Fallback: Last-click attribution logic within last 24 hours
    if (!attributedCampaignId) {
      const logs = await db.campaignLogs.find({ customerId });
      const activeClickedLogs = logs
        .filter(l => l.status === 'clicked' || l.status === 'opened')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      if (activeClickedLogs.length > 0) {
        // Double-check recency (e.g. 24 hour threshold)
        const recencyMs = Date.now() - new Date(activeClickedLogs[0].updatedAt).getTime();
        if (recencyMs < 24 * 60 * 60 * 1000) {
          attributedCampaignId = activeClickedLogs[0].campaignId;
        }
      }
    }

    // Process Campaign Attribution
    if (attributedCampaignId) {
      const logs = await db.campaignLogs.find({ campaignId: attributedCampaignId, customerId });
      const log = logs.length > 0 ? logs[0] : null;
      if (log && log.status !== 'converted') {
        await db.campaignLogs.updateStatus(attributedCampaignId, customerId, 'converted');
        await db.campaigns.incrementMetric(attributedCampaignId, 'convertedCount');
      }
    }

    res.status(201).json({
      order,
      attributedCampaignId: attributedCampaignId || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

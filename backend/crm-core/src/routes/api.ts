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

// 2. Data Seeding Endpoint (to make local testing instant)
router.post('/customers/seed', async (req: Request, res: Response) => {
  try {
    // Clear existing
    await db.customers.clear();
    await db.orders.clear();

    const now = new Date();
    
    // Helper function to subtract days
    const daysAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d.toISOString();
    };

    // 15 realistic mock customers
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

    for (const item of seedData) {
      // Create Customer
      const cust = await db.customers.create({
        name: item.name,
        email: item.email,
        phone: item.phone,
        totalSpend: 0, // Will be incremented by order creation
        lastOrderDate: null,
      });

      // Create Orders
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

    res.json({ message: 'Seed successful. Ingested 15 customers and their purchase histories.' });
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
    
    // Estimate audience size based on criteria
    const matchedAudience = await segmentationService.filterCustomers(aiAnalysis.audienceCriteria);

    res.json({
      analysis: aiAnalysis,
      estimatedAudienceSize: matchedAudience.length,
      matchedCustomers: matchedAudience.map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
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

// 5. Send Campaign (Launches simulator + makes AI custom messages)
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

    // Get audience segment
    const targetCustomers = await segmentationService.filterCustomers(campaign.audienceCriteria);
    if (targetCustomers.length === 0) {
      await db.campaigns.update(campaignId, { status: 'Draft', audienceSize: 0 });
      return res.status(200).json({
        warning: 'Audience segment is empty. Campaign saved as Draft. Please seed customer data or adjust filter queries.',
        isDraft: true,
        audienceSize: 0
      });
    }

    // Update campaign status to Running and reset metrics
    await db.campaigns.update(campaignId, {
      status: 'Running',
      audienceSize: targetCustomers.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0
    });

    const callbackUrl = `http://localhost:5000/api/campaigns/${campaignId}/callback`;
    const recipientsToSend = [];

    // Hyper-personalize messages for each recipient
    for (const customer of targetCustomers) {
      const orders = await db.orders.find({ customerId: customer._id });
      const customMessage = await aiService.generatePersonalizedMessage(campaign.messageTemplate, customer, orders);

      // Create initial campaign log entry (status: sent)
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

      // Increment sentCount
      await db.campaigns.incrementMetric(campaignId, 'sentCount');

      recipientsToSend.push({
        customerId: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customMessage
      });
    }

    // Call external Channel Simulator API
    try {
      await axios.post(`${SIMULATOR_URL}/api/send`, {
        campaignId,
        callbackUrl,
        channel: campaign.channel,
        recipients: recipientsToSend
      });
    } catch (simError: any) {
      console.error('[CRM Core] Error calling Channel Simulator:', simError.message);
      // Fallback: If channel simulator is offline, mark all sent messages as failed immediately
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

// 6. Campaign Callback Handler (called by Channel Simulator)
router.post('/campaigns/:id/callback', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const { customerId, status } = req.body;

  if (!customerId || !status) {
    return res.status(400).json({ error: 'Missing customerId or status' });
  }

  try {
    // 1. Get existing log to check current status
    const logs = await db.campaignLogs.find({ campaignId, customerId });
    const log = logs.length > 0 ? logs[0] : null;

    if (!log) {
      return res.status(404).json({ error: 'Campaign log entry not found' });
    }

    // If the status is the same, ignore it to prevent double counting
    if (log.status === status) {
      return res.sendStatus(200);
    }

    // 2. Update individual log entry status
    await db.campaignLogs.updateStatus(campaignId, customerId, status);

    // 3. Increment new status count
    if (status === 'delivered') await db.campaigns.incrementMetric(campaignId, 'deliveredCount');
    if (status === 'failed') await db.campaigns.incrementMetric(campaignId, 'failedCount');
    if (status === 'opened') await db.campaigns.incrementMetric(campaignId, 'openedCount');
    if (status === 'clicked') await db.campaigns.incrementMetric(campaignId, 'clickedCount');

    // 4. Update campaign overall status to Completed if all callbacks finished
    const campaign = await db.campaigns.findById(campaignId);
    if (campaign) {
      const totalProcessed = campaign.deliveredCount + campaign.failedCount;
      // If we processed all recipients (either delivered or failed), mark campaign as Completed
      if (totalProcessed >= campaign.audienceSize) {
        await db.campaigns.update(campaignId, { status: 'Completed' });
        console.log(`🎉 [CRM Core] Campaign ${campaignId} has fully completed!`);
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('[CRM Core] Error in callback handler:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 7. Get campaigns with stats
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const campaigns = await db.campaigns.find();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get specific campaign with its customer logs
router.get('/campaigns/:id', async (req: Request, res: Response) => {
  const campaignId = req.params.id;

  try {
    const campaign = await db.campaigns.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const logs = await db.campaignLogs.find({ campaignId });
    res.json({
      campaign,
      logs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Dashboard Global Analytics Summary
router.get('/analytics/dashboard', async (req: Request, res: Response) => {
  try {
    const campaigns = await db.campaigns.find();
    const customers = await db.customers.find();

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

    const activeCampaigns = campaigns.filter(c => c.status === 'Running').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;

    res.json({
      customerCount: customers.length,
      campaignCount: campaigns.length,
      activeCampaigns,
      completedCampaigns,
      metrics: {
        sent: totalSent,
        delivered: totalDelivered,
        opened: totalOpened,
        clicked: totalClicked,
        failed: totalFailed,
        openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
        clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0,
        deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

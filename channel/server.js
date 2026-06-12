// ============================================================
// ReachAI Channel Service - Simulated Message Delivery
// ============================================================
// This is a SEPARATE SERVICE from the CRM. It simulates what
// a real channel provider (like Twilio, MSG91, Gupshup) does:
//
// 1. Receives messages from the CRM
// 2. "Delivers" them (simulated)
// 3. Calls back the CRM with status updates:
//    sent → delivered → opened → clicked (or failed)
//
// The lifecycle simulation includes realistic delays and
// failure rates to mimic real-world behavior.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5001; // Runs on port 5001 to match crm-core configuration

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ----- Configuration for realistic simulation -----
// These rates simulate real-world channel performance
const CHANNEL_CONFIG = {
  email: {
    deliveryRate: 0.92,    // 92% of emails get delivered
    openRate: 0.35,        // 35% of delivered emails get opened
    clickRate: 0.12,       // 12% of opened emails get clicked
    deliveryDelay: [1, 5], // 1-5 seconds to "deliver"
    openDelay: [5, 30],    // 5-30 seconds to "open"
    clickDelay: [3, 15],   // 3-15 seconds after open to "click"
  },
  sms: {
    deliveryRate: 0.95,
    openRate: 0.90,        // SMS has high "open" rate (read rate)
    clickRate: 0.05,       // Low click-through for SMS
    deliveryDelay: [1, 3],
    openDelay: [2, 10],
    clickDelay: [5, 20],
  },
  whatsapp: {
    deliveryRate: 0.88,
    openRate: 0.75,        // WhatsApp has "read" receipts
    clickRate: 0.15,
    deliveryDelay: [1, 4],
    openDelay: [3, 15],
    clickDelay: [5, 20],
  },
  rcs: {
    deliveryRate: 0.80,    // RCS has lower delivery (not all phones support it)
    openRate: 0.60,
    clickRate: 0.20,       // But higher engagement when delivered
    deliveryDelay: [2, 6],
    openDelay: [5, 20],
    clickDelay: [5, 15],
  },
};

const FAILURE_REASONS = [
  'Invalid recipient address',
  'Recipient inbox full',
  'Temporary delivery failure',
  'Rate limit exceeded',
  'Recipient opted out',
  'Network timeout',
  'Invalid phone number format',
  'Carrier rejected message',
];

// ----- Helper Functions -----

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Send a status callback to the CRM
async function sendCallback(callbackUrl, data) {
  try {
    console.log(`[Webhook Trigger] Campaign: ${data.campaignId || data.campaign_id} | Customer: ${data.customerId || data.external_id} | Status: ${data.status} -> Posting to ${callbackUrl}`);
    
    // Retry logic (startup robustness)
    let retries = 3;
    while (retries > 0) {
      try {
        await fetch(callbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break; // Success
      } catch (err) {
        retries--;
        console.warn(`[Webhook Warn] Failed callback for ${data.customerId || data.external_id} (${data.status}). Retries remaining: ${retries}. Error: ${err.message}`);
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retry
      }
    }
  } catch (err) {
    console.error(`Failed to send callback for ${data.external_id || data.customerId}:`, err.message);
  }
}

// Simulate the full lifecycle of a single message
async function simulateDelivery(campaignId, message, config, callbackUrl) {
  const { external_id } = message;

  // Step 1: Simulate delivery attempt (with delay)
  const deliveryDelay = randomBetween(config.deliveryDelay[0], config.deliveryDelay[1]) * 1000;
  await new Promise(resolve => setTimeout(resolve, deliveryDelay));

  // Did it deliver successfully?
  if (Math.random() < config.deliveryRate) {
    // SUCCESS: Message delivered
    await sendCallback(callbackUrl, {
      campaignId,
      campaign_id: campaignId,
      customerId: external_id,
      external_id,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    });

    // Step 2: Simulate open/read (with delay)
    const openDelay = randomBetween(config.openDelay[0], config.openDelay[1]) * 1000;
    await new Promise(resolve => setTimeout(resolve, openDelay));

    if (Math.random() < config.openRate) {
      // Message was opened/read
      await sendCallback(callbackUrl, {
        campaignId,
        campaign_id: campaignId,
        customerId: external_id,
        external_id,
        status: 'opened',
        timestamp: new Date().toISOString(),
      });

      // Step 3: Simulate click (with delay)
      const clickDelay = randomBetween(config.clickDelay[0], config.clickDelay[1]) * 1000;
      await new Promise(resolve => setTimeout(resolve, clickDelay));

      if (Math.random() < config.clickRate) {
        // User clicked a link in the message
        await sendCallback(callbackUrl, {
          campaignId,
          campaign_id: campaignId,
          customerId: external_id,
          external_id,
          status: 'clicked',
          timestamp: new Date().toISOString(),
        });
      }
    }
  } else {
    // FAILURE: Message failed to deliver
    await sendCallback(callbackUrl, {
      campaignId,
      campaign_id: campaignId,
      customerId: external_id,
      external_id,
      status: 'failed',
      timestamp: new Date().toISOString(),
      failure_reason: randomFrom(FAILURE_REASONS),
    });
  }
}

// ----- API Endpoints -----

// POST /api/send - Receive messages from CRM and simulate delivery
app.post('/api/send', async (req, res) => {
  const campaignId = req.body.campaignId || req.body.campaign_id;
  const callbackUrl = req.body.callbackUrl || req.body.callback_url;
  const rawChannel = req.body.channel;
  
  // Support either 'messages' or 'recipients'
  const rawMessages = req.body.messages || req.body.recipients;

  if (!rawMessages || !Array.isArray(rawMessages) || !callbackUrl) {
    return res.status(400).json({ error: 'messages/recipients array and callbackUrl are required' });
  }

  // Map input messages to a unified structure
  const messages = rawMessages.map(item => {
    const external_id = item.external_id || item.customerId;
    const itemChannel = (item.channel || rawChannel || 'email').toLowerCase();
    const recipient = item.recipient || (itemChannel === 'email' ? item.email : item.phone);
    const body = item.body || item.customMessage;

    return {
      external_id,
      channel: itemChannel,
      recipient,
      body
    };
  });

  console.log(`📨 Received ${messages.length} messages for campaign ${campaignId}`);
  console.log(`📞 Will callback to: ${callbackUrl}`);

  // Acknowledge receipt immediately (async processing)
  res.json({
    success: true,
    accepted: messages.length,
    message: `Processing ${messages.length} messages asynchronously`,
  });

  // Process each message asynchronously
  for (const message of messages) {
    const config = CHANNEL_CONFIG[message.channel] || CHANNEL_CONFIG.email;

    // Don't await - process all messages concurrently
    simulateDelivery(campaignId, message, config, callbackUrl).catch(err => {
      console.error(`Error simulating delivery for ${message.external_id}:`, err);
    });
  }
});

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reachai-channel-service' });
});

// GET /api/config - Show channel configuration
app.get('/api/config', (req, res) => {
  res.json({ channels: CHANNEL_CONFIG });
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`📡 ReachAI Channel Service running on port ${PORT}`);
  console.log(`   Simulating delivery for: ${Object.keys(CHANNEL_CONFIG).join(', ')}`);
});

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

interface Recipient {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  customMessage: string;
}

interface SendRequestBody {
  campaignId: string;
  callbackUrl: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  recipients: Recipient[];
}

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'channel-simulator' });
});

// Endpoint to receive bulk send request
app.post('/api/send', (req: Request, res: Response) => {
  const { campaignId, callbackUrl, channel, recipients } = req.body as SendRequestBody;

  if (!campaignId || !callbackUrl || !channel || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ error: 'Missing required parameters (campaignId, callbackUrl, channel, recipients)' });
  }

  console.log(`[Simulator] Received campaign ${campaignId} with ${recipients.length} recipients via ${channel}.`);
  console.log(`[Simulator] Callback URL configured: ${callbackUrl}`);

  // Return immediate 202 Accepted
  res.status(202).json({
    status: 'processing',
    message: `Enqueued ${recipients.length} messages for campaign ${campaignId}. Callback will be sent to ${callbackUrl}.`,
  });

  // Process asynchronously
  processCampaignSimulation(campaignId, callbackUrl, channel, recipients);
});

// Asynchronous Simulation Loop
async function processCampaignSimulation(campaignId: string, callbackUrl: string, channel: string, recipients: Recipient[]) {
  console.log(`[Simulator] Starting simulation background thread for campaign ${campaignId}...`);

  for (const recipient of recipients) {
    // We execute each recipient's simulation with staggered starting times so they do not overlap all at once.
    simulateSingleRecipient(campaignId, callbackUrl, channel, recipient);
  }
}

function simulateSingleRecipient(campaignId: string, callbackUrl: string, channel: string, recipient: Recipient) {
  const { customerId, name, email, phone } = recipient;
  const destination = channel === 'Email' ? email : phone;

  // 1. Sent status callback (triggered immediately)
  sendWebhook(callbackUrl, campaignId, customerId, 'sent');

  // 2. Delivery simulation (after 1.5 seconds)
  setTimeout(() => {
    // 90% delivery rate, 10% failure rate
    const isDelivered = Math.random() > 0.1;
    const status = isDelivered ? 'delivered' : 'failed';
    
    sendWebhook(callbackUrl, campaignId, customerId, status);

    if (isDelivered) {
      // 3. Open simulation (after another 2-3 seconds)
      setTimeout(() => {
        // 75% open rate
        const isOpened = Math.random() > 0.25;
        if (isOpened) {
          sendWebhook(callbackUrl, campaignId, customerId, 'opened');

          // 4. Click simulation (after another 2-3 seconds)
          setTimeout(() => {
            // 40% click rate
            const isClicked = Math.random() > 0.6;
            if (isClicked) {
              sendWebhook(callbackUrl, campaignId, customerId, 'clicked');
            }
          }, 2000 + Math.random() * 2000);
        }
      }, 2000 + Math.random() * 2000);
    }
  }, 1500);
}

// Helper function to send status callback to CRM Core
async function sendWebhook(url: string, campaignId: string, customerId: string, status: string) {
  try {
    console.log(`[Webhook Trigger] Campaign: ${campaignId} | Customer: ${customerId} | Status: ${status} -> Posting to ${url}`);
    
    // Retry logic (startup robustness)
    let retries = 3;
    while (retries > 0) {
      try {
        await axios.post(url, {
          campaignId,
          customerId,
          status,
          timestamp: new Date().toISOString()
        });
        break; // Success
      } catch (err: any) {
        retries--;
        console.warn(`[Webhook Warn] Failed callback for ${customerId} (${status}). Retries remaining: ${retries}. Error: ${err.message}`);
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retry
      }
    }
  } catch (error: any) {
    console.error(`[Webhook Error] Failed to callback CRM Core at ${url}: ${error.message}`);
  }
}

app.listen(PORT, () => {
  console.log(`[Simulator] Channel Simulator listening on port ${PORT}`);
});

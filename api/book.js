// book.js — SSync Portfolio Backend
// Run: node book.js
// Requires: npm install express cors node-fetch

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Replace with your actual Discord webhook URLs ──
const DISCORD_BOOKING_WEBHOOK = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
const DISCORD_CONTACT_WEBHOOK = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
// You can use the same webhook for both if you prefer

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve your HTML from /public

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── POST /book — Handle call booking ──
app.post('/book', async (req, res) => {
  const { name, email, date, time } = req.body;

  // Validation
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields: name, email, date, time' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Discord embed payload
  const discordPayload = {
    username: 'SSync Bookings',
    avatar_url: 'https://i.pinimg.com/736x/5a/57/9e/5a579e10489f33eaae2f1de49dc9f9c4.jpg',
    embeds: [
      {
        title: '🚀 New Call Booking',
        color: 0xa855f7, // purple to match site accent
        fields: [
          { name: '👤 Name',  value: name,  inline: true },
          { name: '📧 Email', value: email, inline: true },
          { name: '\u200B',   value: '\u200B', inline: false }, // spacer
          { name: '📅 Date',  value: date,  inline: true },
          { name: '🕐 Time',  value: time,  inline: true },
          { name: '📍 Platform', value: 'Google Meet', inline: true },
        ],
        footer: {
          text: `Received at ${timestamp} IST · SSync Portfolio`,
        },
        thumbnail: {
          url: 'https://i.pinimg.com/736x/5a/57/9e/5a579e10489f33eaae2f1de49dc9f9c4.jpg',
        },
      },
    ],
  };

  try {
    const webhookRes = await fetch(DISCORD_BOOKING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      console.error('Discord webhook error (booking):', errText);
      return res.status(502).json({ error: 'Failed to send to Discord. Please try again.' });
    }

    console.log(`[BOOKING] ${name} <${email}> booked for ${date} at ${time}`);
    return res.status(200).json({ success: true, message: 'Booking confirmed!' });

  } catch (err) {
    console.error('Server error (booking):', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /contact — Handle message form ──
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
  }

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Discord embed payload
  const discordPayload = {
    username: 'SSync Messages',
    avatar_url: 'https://i.pinimg.com/736x/5a/57/9e/5a579e10489f33eaae2f1de49dc9f9c4.jpg',
    embeds: [
      {
        title: '📩 New Message Received',
        color: 0x3b82f6, // blue accent
        fields: [
          { name: '👤 Name',  value: name,  inline: true },
          { name: '📧 Email', value: email, inline: true },
          { name: '💬 Message', value: message.slice(0, 1024), inline: false },
        ],
        footer: {
          text: `Received at ${timestamp} IST · SSync Portfolio`,
        },
      },
    ],
  };

  try {
    const webhookRes = await fetch(DISCORD_CONTACT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      console.error('Discord webhook error (contact):', errText);
      return res.status(502).json({ error: 'Failed to send message. Please try again.' });
    }

    console.log(`[CONTACT] ${name} <${email}> sent a message`);
    return res.status(200).json({ success: true, message: 'Message sent!' });

  } catch (err) {
    console.error('Server error (contact):', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Utility ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── 404 fallback ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`✅ SSync backend running on http://localhost:${PORT}`);
});

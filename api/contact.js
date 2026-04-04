export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Guard: webhook URL must be set
  if (!process.env.DISCORD_WEBHOOK_CONTACT) {
    console.error("DISCORD_WEBHOOK_CONTACT env variable is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { name, email, message, page } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields: name, email, message" });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Truncate message to Discord's safe limit
  const safeMessage = message.slice(0, 1800);

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const payload = {
    username: "SSync Messages",
    embeds: [
      {
        title: "📩 New Message Received",
        color: 0x3b82f6,
        fields: [
          { name: "👤 Name",    value: name,  inline: true },
          { name: "📧 Email",   value: email, inline: true },
          { name: "💬 Message", value: safeMessage, inline: false }
        ],
        footer: {
          text: `Received at ${timestamp} IST · ${page || "SSync Portfolio"}`
        }
      }
    ]
  };

  try {
    const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_CONTACT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      console.error("Discord webhook error (contact):", errText);
      return res.status(502).json({ error: "Failed to send message. Please try again." });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Server error in /api/contact:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

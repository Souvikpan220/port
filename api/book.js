export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Guard: webhook URL must be set
  if (!process.env.DISCORD_WEBHOOK_BOOKING) {
    console.error("DISCORD_WEBHOOK_BOOKING env variable is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { name, email, date, time } = req.body;

  // Validate required fields
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: "Missing required fields: name, email, date, time" });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const payload = {
    username: "SSync Bookings",
    embeds: [
      {
        title: "🚀 New Call Booking",
        color: 0xa855f7,
        fields: [
          { name: "👤 Name",     value: name,          inline: true },
          { name: "📧 Email",    value: email,         inline: true },
          { name: "\u200B",      value: "\u200B",      inline: false },
          { name: "📅 Date",     value: date,          inline: true },
          { name: "🕐 Time",     value: time,          inline: true },
          { name: "📍 Platform", value: "Google Meet", inline: true }
        ],
        footer: {
          text: `Booked at ${timestamp} IST · SSync Portfolio`
        }
      }
    ]
  };

  try {
    const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_BOOKING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      console.error("Discord webhook error (booking):", errText);
      return res.status(502).json({ error: "Failed to send notification. Please try again." });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Server error in /api/book:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

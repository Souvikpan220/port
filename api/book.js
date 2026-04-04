export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, date, time } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const payload = {
    embeds: [
      {
        title: "🚀 New Call Booking",
        color: 0xa855f7,
        fields: [
          { name: "👤 Name", value: name, inline: true },
          { name: "📧 Email", value: email, inline: true },
          { name: "📅 Date", value: date, inline: true },
          { name: "🕐 Time", value: time, inline: true }
        ],
        footer: {
          text: `Booked at ${new Date().toLocaleString()}`
        }
      }
    ]
  };

  await fetch(process.env.DISCORD_WEBHOOK_BOOKING, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  res.status(200).json({ success: true });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { country, city, region, ip, userAgent, page } = req.body;

    const message = {
      content: `👀 **New Visitor**
🌍 Country: ${country}
🏙 City: ${city}
📍 Region: ${region}
🌐 IP: ${ip}

🕒 Time: ${new Date().toLocaleString()}
📄 Page: ${page}
💻 Device: ${userAgent}`
    };

    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Logging failed" });
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, date, time } = req.body;

    const payload = {
      content: `📅 **New Booking**
👤 Name: ${name}
📧 Email: ${email}

🗓 Date: ${date}
⏰ Time: ${time}

🕒 Booked At: ${new Date().toLocaleString()}`
    };

    await fetch(process.env.DISCORD_WEBHOOK_BOOKING, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
}
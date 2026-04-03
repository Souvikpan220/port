export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message, page } = req.body;

  const payload = {
    content: `📩 **New Inquiry**
👤 Name: ${name}
📧 Email: ${email}

💬 Message:
${message}

🌐 Page: ${page}
🕒 Time: ${new Date().toLocaleString()}`
  };

  await fetch(process.env.DISCORD_WEBHOOK_CONTACT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  res.status(200).json({ success: true });
}
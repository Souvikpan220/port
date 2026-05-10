export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Pabbly webhook check
  if (!process.env.PABBLY_WEBHOOK_CONTACT) {
    console.error("PABBLY_WEBHOOK_CONTACT env variable is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { name, email, message, page, budget, project } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields: name, email, message"
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email address"
    });
  }

  // Trim long messages
  const safeMessage = message.slice(0, 3000);

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });

  // Clean payload for Pabbly
  const payload = {
    name,
    email,
    project: project || "Not Provided",
    budget: budget || "Not Provided",
    message: safeMessage,
    page: page || "SSync Portfolio",
    timestamp
  };

  try {
    const webhookRes = await fetch(
      process.env.PABBLY_WEBHOOK_CONTACT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();

      console.error("Pabbly webhook error:", errText);

      return res.status(502).json({
        error: "Failed to send message. Please try again."
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {
    console.error("Server error in /api/contact:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

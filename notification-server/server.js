import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ Middleware
app.use(cors());           // allow your React app to call this API
app.use(express.json());   // parse JSON request bodies

// ✅ Notification endpoint
app.post("/api/notify", async (req, res) => {
  try {
    const { toEmail, subject, text, html } = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: "Missing toEmail" });
    }

    const projectId = process.env.NOTIFICATION_API_PROJECT;
    const apiKey = process.env.NOTIFICATION_API_KEY;

    if (!projectId || !apiKey) {
      return res.status(500).json({ error: "Server missing NotificationAPI credentials" });
    }

    const authHeader = "Basic " + Buffer.from(`${projectId}:${apiKey}`).toString("base64");

    const payload = {
      type: "send",
      to: { email: toEmail },
      email: { subject, text, html },
    };

    const response = await fetch(`https://api.notificationapi.com/${projectId}/sender`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    res.status(response.status).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start server (Railway will set process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

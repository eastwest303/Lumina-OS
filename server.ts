import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory array to act as our relationship graph / events database MVP
  const events: any[] = [
      { type: "SYSTEM", payload: "Demo workspace initialized.", timestamp: new Date() }
  ];
  const contacts: any[] = [
    { id: 1, name: "Sarah Jenkins", stage: "Qualified", risk: "Low", lastContact: "Today", intentScore: 85 },
    { id: 2, name: "Michael Chen", stage: "Touring", risk: "High", lastContact: "Yesterday", intentScore: 92 },
    { id: 3, name: "David West", stage: "Dormant", risk: "Low", lastContact: "12 Days Ago", intentScore: 45 },
    { id: 4, name: "Jessica Alba", stage: "Lead", risk: "Medium", lastContact: "2 Hrs Ago", intentScore: 68 }
  ];
  const deals: any[] = [
    { id: 101, address: "123 Maple St", stage: "Touring", probability: 70, expectedClose: "Next Month" },
    { id: 102, address: "902 Hillside Avenue", stage: "Under Contract", probability: 95, expectedClose: "In 14 Days" },
    { id: 103, address: "Project West", stage: "Lead", probability: 45, expectedClose: "Unknown" },
    { id: 104, address: "442 Ocean Blvd", stage: "Touring", probability: 82, expectedClose: "Next Week" }
  ];

  // API constraints checklist:
  // - All API routes must start with /api
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/dashboard", (req, res) => {
    res.json({
        contacts,
        deals,
        alerts: [
            { id: 1, message: "Communication gap with David West detected. Sentiment is cooling.", urgency: "High" },
            { id: 2, message: "Interest rates dip predicted. Automating 12 client alerts.", urgency: "Medium" }
        ],
        recentEvents: events.slice(-5)
    })
  });

  app.post("/api/ask", async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
           return res.status(500).json({ error: "Gemini API key is missing. Please add it to your secrets." });
        }
        const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        
        const systemPrompt = `You are a self-improving AI Real Estate Operating System. 
Respond to the user's commands concisely, simulating actions taken on their CRM and relationship database.
You have access to the following contacts: ${JSON.stringify(contacts)}.
You have access to the following deals: ${JSON.stringify(deals)}.`;

        const chat = ai.chats.create({
            model: "gemini-3.5-flash",
            config: {
                systemInstruction: systemPrompt
            }
        });

        const response = await chat.sendMessage({ message: query });
        
        events.push({ type: "VOICE_COMMAND", payload: query, timestamp: new Date() });

        res.json({ text: response.text });
    } catch (e: any) {
        console.error("AI Error:", e);
        res.status(500).json({ error: e.message || "Failed to contact AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

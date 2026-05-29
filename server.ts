import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse Cloudinary URL
const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
let cloudinaryCloudName = "";
let cloudinaryApiKey = "";
let cloudinaryApiSecret = "";

if (cloudinaryUrl.startsWith("cloudinary://")) {
  const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (matches) {
    cloudinaryApiKey = matches[1];
    cloudinaryApiSecret = matches[2];
    cloudinaryCloudName = matches[3];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: "10mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Secure image upload proxy to Cloudinary
  app.post("/api/upload", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
        return res.status(500).json({ error: "Cloudinary credentials not properly configured on server" });
      }

      const authHeader = 'Basic ' + Buffer.from(cloudinaryApiKey + ':' + cloudinaryApiSecret).toString('base64');
      
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: "POST",
        headers: {
          "Authorization": authHeader
        },
        body: formData
      });

      const result = await response.json() as any;
      if (!response.ok) {
        console.error("Cloudinary API Error:", result);
        return res.status(500).json({ error: result.error?.message || "Cloudinary upload failed" });
      }

      res.json({ url: result.secure_url });
    } catch (error: any) {
      console.error("Upload proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lapata server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

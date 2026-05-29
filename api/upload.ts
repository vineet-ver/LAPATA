import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

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

    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      return res.status(500).json({ error: "Cloudinary credentials not configured on server" });
    }

    const authHeader = 'Basic ' + Buffer.from(cloudinaryApiKey + ':' + cloudinaryApiSecret).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append("file", image);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const result = await response.json() as any;
    if (!response.ok) {
      console.error("Cloudinary API Error:", result);
      return res.status(500).json({ error: result.error?.message || "Cloudinary upload failed" });
    }

    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Vercel serverless upload error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

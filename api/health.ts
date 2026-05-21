export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: "ok",
    initialized: !!process.env.GEMINI_API_KEY,
    platform: "vercel-serverless",
    timestamp: new Date().toISOString()
  });
}

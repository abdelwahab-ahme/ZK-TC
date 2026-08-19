export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    server: "Zakora-TC Backend API",
    timestamp: new Date().toISOString(),
    capabilities: {
      getEnabled: true,
      postEnabled: true,
      database: "Supabase"
    }
  });
}
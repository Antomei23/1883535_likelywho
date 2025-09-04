const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Mock routes (per testare subito il frontend)
app.get("/api/groups", (req, res) => {
  res.json([
    { id: 1, name: "Group 1", members: 5 },
    { id: 2, name: "Group 2", members: 3 },
    { id: 3, name: "Gruppo di esempio", members: 3 },
  ]);
});

app.post("/api/groups", (req, res) => {
  res.json({ success: true, created: req.body });
});

// 🔹 Quando avrai i microservizi veri, aggiungi proxy
// esempio:
// app.use("/api/users", createProxyMiddleware({ target: "http://users:4001", changeOrigin: true }));
// app.use("/api/votes", createProxyMiddleware({ target: "http://votes:4002", changeOrigin: true }));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
});

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render PostgreSQL URL
  ssl: {
    rejectUnauthorized: false,
  },
});

// API Endpoint to Receive ESP32 Data
app.post("/data", async (req, res) => {
  const { value } = req.body; // Receiving sensor data
  try {
    await pool.query("INSERT INTO sensor_data (value) VALUES ($1)", [value]);
    res.status(200).json({ message: "Data stored successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

// API Endpoint to Fetch Sensor Data
app.get("/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 10");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

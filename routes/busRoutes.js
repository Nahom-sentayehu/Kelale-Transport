const express = require("express");
const router = express.Router();

// Example in-memory "database"
let buses = [
  { id: 1, name: "Bus A", seats: 40 },
  { id: 2, name: "Bus B", seats: 30 },
];

// ---------- GET all buses ----------
router.get("/", (req, res) => {
  res.json(buses);
});

// ---------- GET a single bus by ID ----------
router.get("/:id", (req, res) => {
  const bus = buses.find(b => b.id === parseInt(req.params.id));
  if (!bus) return res.status(404).json({ message: "Bus not found" });
  res.json(bus);
});

// ---------- CREATE a new bus ----------
router.post("/", (req, res) => {
  const { name, seats } = req.body;
  if (!name || !seats) return res.status(400).json({ message: "Missing data" });

  const newBus = {
    id: buses.length + 1,
    name,
    seats
  };
  buses.push(newBus);
  res.status(201).json(newBus);
});

// ---------- UPDATE a bus ----------
router.put("/:id", (req, res) => {
  const bus = buses.find(b => b.id === parseInt(req.params.id));
  if (!bus) return res.status(404).json({ message: "Bus not found" });

  const { name, seats } = req.body;
  if (name) bus.name = name;
  if (seats) bus.seats = seats;

  res.json(bus);
});

// ---------- DELETE a bus ----------
router.delete("/:id", (req, res) => {
  const busIndex = buses.findIndex(b => b.id === parseInt(req.params.id));
  if (busIndex === -1) return res.status(404).json({ message: "Bus not found" });

  const deletedBus = buses.splice(busIndex, 1);
  res.json({ message: "Bus deleted", bus: deletedBus[0] });
});

module.exports = router;

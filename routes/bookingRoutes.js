const express = require("express");
const router = express.Router();

// Example in-memory "database"
let bookings = [
  { id: 1, busId: 1, user: "Alice", seat: 5 },
  { id: 2, busId: 2, user: "Bob", seat: 10 },
];

// ---------- GET all bookings ----------
router.get("/", (req, res) => {
  res.json(bookings);
});

// ---------- GET a booking by ID ----------
router.get("/:id", (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

// ---------- CREATE a new booking ----------
router.post("/", (req, res) => {
  const { busId, user, seat } = req.body;
  if (!busId || !user || !seat) {
    return res.status(400).json({ message: "Missing booking data" });
  }

  const newBooking = {
    id: bookings.length + 1,
    busId,
    user,
    seat
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// ---------- UPDATE a booking ----------
router.put("/:id", (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const { busId, user, seat } = req.body;
  if (busId) booking.busId = busId;
  if (user) booking.user = user;
  if (seat) booking.seat = seat;

  res.json(booking);
});

// ---------- DELETE a booking ----------
router.delete("/:id", (req, res) => {
  const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Booking not found" });

  const deletedBooking = bookings.splice(index, 1);
  res.json({ message: "Booking deleted", booking: deletedBooking[0] });
});

module.exports = router;

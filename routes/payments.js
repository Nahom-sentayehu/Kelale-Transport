const express = require('express');
const router = express.Router();

// simulate a payment (frontend will call this to mark a booking as paid)
// POST /api/payments/simulate
// body: { bookingId: string, amount: number }
router.post('/simulate', async (req,res)=>{
  try{
    const { bookingId, amount } = req.body;
    if(!bookingId) return res.status(400).json({msg:'Missing bookingId'});
    // In real integration, call payment gateway here.
    // We'll return a simulated success response.
    return res.json({ status: 'success', bookingId, amount, transactionId: 'SIM-'+Date.now() });
  }catch(e){ console.error(e); res.status(500).json({msg:'Server error'}); }
});

module.exports = router;

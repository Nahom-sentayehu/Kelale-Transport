const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Bus = require('../models/Bus');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

// Configure multer for bus image uploads
const busImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/bus-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bus-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const busImageUpload = multer({ 
  storage: busImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

/**
 * @openapi
 * /api/buses:
 *   get:
 *     tags:
 *       - Buses
 *     summary: Get all buses
 *     responses:
 *       200:
 *         description: list of buses
 */
router.get('/', async (req,res)=>{
  const buses = await Bus.find().populate('company');
  res.json(buses);
});

// get my company buses (company dashboard)
router.get('/my-buses', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const buses = await Bus.find({ company: company._id });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create bus (company only)
router.post('/', auth, busImageUpload.single('image'), async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      // Delete uploaded file if not company user
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only company users can create buses' });
    }
    
    // Handle bus image upload
    let image = null;
    if (req.file) {
      image = `/uploads/bus-images/${req.file.filename}`;
    }
    
    const bus = new Bus({
      ...req.body,
      image,
      company: company._id
    });
    await bus.save();
    await bus.populate('company');
    res.json(bus);
  } catch (err) {
    // Delete uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// update bus (company only)
router.put('/:id', auth, busImageUpload.single('image'), async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      // Delete uploaded file if not company user
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only company users can update buses' });
    }
    
    const bus = await Bus.findOne({ _id: req.params.id, company: company._id });
    if (!bus) {
      // Delete uploaded file if bus not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Handle bus image upload - if new image provided, delete old one
    if (req.file) {
      if (bus.image) {
        const oldImagePath = bus.image.replace('/uploads/', 'uploads/');
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (unlinkErr) {
          console.error('Error deleting old bus image:', unlinkErr);
        }
      }
      req.body.image = `/uploads/bus-images/${req.file.filename}`;
    }
    
    Object.assign(bus, req.body);
    await bus.save();
    await bus.populate('company');
    res.json(bus);
  } catch (err) {
    // Delete uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// delete bus (company only)
router.delete('/:id', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can delete buses' });
    }
    
    const bus = await Bus.findOne({ _id: req.params.id, company: company._id });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    await Bus.deleteOne({ _id: req.params.id });
    res.json({ message: 'Bus deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

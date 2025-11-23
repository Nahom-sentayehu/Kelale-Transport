const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Configure multer for company logo uploads
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/company-logos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoUpload = multer({ 
  storage: logoStorage,
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

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.message) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: 'File upload error' });
  }
  next();
};

// Test route to verify endpoint is accessible
router.get('/test', (req, res) => {
  res.json({ message: 'Companies endpoint is working!' });
});

// list companies
router.get('/', async (req,res)=>{
  const companies = await Company.find().populate('user', 'name email');
  res.json(companies);
});

// get company by user (for company dashboard)
router.get('/my-company', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id }).populate('user');
    if (!company) {
      return res.status(404).json({ message: 'No company assigned to this user' });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add company (admin only - creates company and assigns user)
router.post('/', logoUpload.single('logo'), handleMulterError, auth, async (req,res)=>{
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ message: 'User not found' });
    }
    if (adminUser.role !== 'admin') {
      // Delete uploaded file if not admin
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only admins can create companies' });
    }

    const { name, description, contact, userEmail, userPassword, userFirstName, userLastName, userPhoneNumber } = req.body;

    if (!name || !userEmail || !userPassword || !userFirstName || !userLastName) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Missing required fields: name, userEmail, userPassword, userFirstName, userLastName' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      // Delete uploaded file if user exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create company user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const userName = `${userFirstName} ${userLastName}`;
    
    const companyUser = new User({
      name: userName,
      firstName: userFirstName,
      lastName: userLastName,
      email: userEmail,
      password: hashedPassword,
      phoneNumber: userPhoneNumber || null,
      role: 'company'
    });
    await companyUser.save();

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = `/uploads/company-logos/${req.file.filename}`;
    }

    // Create company
    const company = new Company({
      name,
      description: description || '',
      contact: contact || '',
      logo,
      user: companyUser._id
    });
    await company.save();

    res.json({
      company,
      user: {
        id: companyUser._id,
        email: companyUser.email,
        name: companyUser.name
      }
    });
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

module.exports = router;

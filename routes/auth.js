const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// register (customer or company)
router.post('/register', upload.single('profilePhoto'), async (req,res)=>{
  try{
    const { firstName, lastName, email, password, phoneNumber, role } = req.body;
    if(!firstName || !lastName || !email || !password) {
      return res.status(400).json({msg:'Missing required fields: firstName, lastName, email, password'});
    }
    const existing = await User.findOne({email});
    if(existing) return res.status(400).json({msg:'Email exists'});
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Create full name from firstName and lastName
    const name = `${firstName} ${lastName}`;
    
    // Handle profile photo
    let profilePhoto = null;
    if (req.file) {
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }
    
    const user = new User({
      name,
      firstName,
      lastName,
      email,
      password: hash,
      phoneNumber: phoneNumber || null,
      profilePhoto,
      role: role || 'customer'
    });
    await user.save();
    const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET || 'secret', {expiresIn:'7d'});
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        role: user.role 
      }, 
      token 
    });
  }catch(e){ 
    // Delete uploaded file if user creation fails
    if(req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error(e); 
    res.status(500).json({msg:'Server error: ' + e.message}); 
  }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({msg:'Invalid credentials'});
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({msg:'Invalid credentials'});
    const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET || 'secret', {expiresIn:'7d'});
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  }catch(e){ console.error(e); res.status(500).json({msg:'Server error'}); }
});

module.exports = router;

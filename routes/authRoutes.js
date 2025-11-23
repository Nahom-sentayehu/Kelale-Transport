const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Register
router.post("/register", upload.single('profilePhoto'), async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, phoneNumber, role, dateOfBirth, gender } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create full name from firstName, middleName (if provided), and lastName
    const nameParts = [firstName];
    if (middleName && middleName.trim()) {
      nameParts.push(middleName.trim());
    }
    nameParts.push(lastName);
    const name = nameParts.join(' ');
    
    // Handle profile photo
    let profilePhoto = null;
    if (req.file) {
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    const newUser = new User({
      name,
      firstName,
      middleName: middleName && middleName.trim() ? middleName.trim() : null,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      profilePhoto,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      role: role || 'customer'
    });

    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });

    res.json({ 
      message: "User registered successfully!", 
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        profilePhoto: newUser.profilePhoto,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        role: newUser.role
      }
    });
  } catch (err) {
    // Delete uploaded file if user creation fails
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

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });

    res.json({ 
      message: "Login successful!", 
      token, 
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
const auth = require('../middleware/auth');
router.put('/profile', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, middleName, lastName, phoneNumber, dateOfBirth, gender } = req.body;

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) user.gender = gender;

    // Update full name
    const nameParts = [user.firstName || ''];
    if (user.middleName) nameParts.push(user.middleName);
    nameParts.push(user.lastName || '');
    user.name = nameParts.filter(p => p).join(' ');

    // Handle profile photo update
    if (req.file) {
      // Delete old profile photo if exists
      if (user.profilePhoto) {
        const oldPhotoPath = user.profilePhoto.replace('/uploads', 'uploads');
        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (unlinkErr) {
            console.error('Error deleting old profile photo:', unlinkErr);
          }
        }
      }
      user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        role: user.role
      }
    });
  } catch (err) {
    // Delete uploaded file if update fails
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

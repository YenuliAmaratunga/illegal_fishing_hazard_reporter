const User = require('../models/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log(phone);
    console.log(password);

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ message: `Account is ${user.status}. Please wait for admin approval.` });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
      
    }

    // Generate JWT token (optional)
    const token = jwt.sign(
      { id: user._id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(token);

    return res.status(200).json({
      message: "Login successful",
      token,
      userName : user.name
      
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
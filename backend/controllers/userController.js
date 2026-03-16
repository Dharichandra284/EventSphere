const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "eventsphere_secret";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "eventsphere_admin_secret";
const VENDOR_SECRET = process.env.VENDOR_SECRET || "eventsphere_vendor_secret";

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });
}

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret, vendorSecret } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    let resolvedRole = "user";
    if (role === "admin") {
      if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret" });
      }
      resolvedRole = "admin";
    }

    if (role === "vendor") {
      if (vendorSecret !== VENDOR_SECRET) {
        return res.status(403).json({ message: "Invalid vendor secret" });
      }
      resolvedRole = "vendor";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: resolvedRole,
      isVerified: true,
    });

    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Signup successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Immediately mark legacy users as verified (OTP flow removed)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get profile
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

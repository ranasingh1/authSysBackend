import { validationResult } from "express-validator";
import { User } from "../db/models/user.js";
import bcrypt from "bcrypt";
import createError from "../utils/error.js";
import jwt from "jsonwebtoken";
const saltRounds = 10;
export const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(409, "Username or email already exists"));
    } else {
      next(err);
    }
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createError(400, "Wrong Email or Password!"));
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT,
      { expiresIn: "1d" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.send("Logged in successfully");
  } catch (err) {
    next(err);
  }
};

export const accessProtected = (req, res) => {
  res.send(`This is a protected page. Hello, ${req.user.username}`);
};

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.send("Logged out successfully");
};

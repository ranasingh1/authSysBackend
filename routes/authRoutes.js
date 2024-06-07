import express from "express";
import {
  accessProtected,
  login,
  logout,
  register,
} from "../controllers/auth.js";
import { body } from "express-validator";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 1 }).escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).escape(),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).escape(),
  ],
  login
);

router.get("/protected", verifyToken, accessProtected);

router.post("/logout", logout);

export default router;

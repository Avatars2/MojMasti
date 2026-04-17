import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordReset.controller.js";

const router = express.Router();

router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

export default router;
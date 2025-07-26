import express from "express";

import { signIn, signUp } from "../controllers/auth.controllers.js";
import { checkToken } from "../../checkToken.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

export default router;

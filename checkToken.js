import { createError } from "./error.js";
import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const token = req.cookies.access_token_weColor;

  if (!token) return next(createError(401, "You are not authenticated"));

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return next(createError(403, "token is not valid"));
    req.user = user;
    next();
  });
};

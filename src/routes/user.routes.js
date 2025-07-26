import express from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  likeAPalette,
  addOrRemoveFromFavorites,
  deleteUserWithPasswordVerification,
  getUsers,
  getFavorites,
  getSavedPalettes,
} from "../controllers/user.controllers.js";
import { checkToken } from "../../checkToken.js";

const router = express.Router();

//Get user
router.get("/find/:id", getUserById);

//Get all users
router.get("/all/", getUsers);

//Update user
router.put("/:id", updateUser);

//Delete user
router.delete("/:id", deleteUser);

//Delete user with password verification

router.delete("/delete/account", deleteUserWithPasswordVerification);

//Like a palette
router.put("/like/:paletteId", likeAPalette);

//Add/ remove a palette from favorites
router.put("/favorites/:paletteId", addOrRemoveFromFavorites);

//Get favorites from user
router.get("/get/favorites/:userId", getFavorites);

//Get saved palettes from user
router.get("/get/saved/:userId", getSavedPalettes);

export default router;

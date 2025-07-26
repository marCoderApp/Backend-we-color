import User from "../models/users.js";
import Palette from "../models/palettes.js";
import bcrypt from "bcrypt";
import { createError } from "../../error.js";

//UPDATE AN USER BY PARAMS ID
export const updateUser = async (req, res, next) => {
  const id = req.body.user.id;
  const reqBody = req.body;
  console.log(reqBody)
    try {
      const userUpdated = await User.findByIdAndUpdate(
        id,
        {
          $set: req.body.user,
        },
        { new: true }
      );
      res.status(200).json({ user: userUpdated, message: "User Updated" });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
      next(error);
    }

};

//DELETE USER USING PASSWORD VERIFICATION

export const deleteUserWithPasswordVerification = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const actualUser = await User.findOne({ email: email });
    if (!actualUser) {
      return res.status(404).json({ message: "Something went wrong" });
    }

    const matchPassword = await bcrypt.compare(password, actualUser.password);

    if (!matchPassword) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (matchPassword) {
      deletePalettesFromDeletedUser(actualUser._id);
      await User.findByIdAndDelete(actualUser._id);
    }

    res.status(201).json({ message: "User has been deleted" });

    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    next();
  }
};

// FINDING AND DELETING ALL PALETTES FROM A DELETED USER

export const deletePalettesFromDeletedUser = async (actualUserId) => {
  try {
    await Palette.deleteMany({ userId: actualUserId });
  } catch (error) {
    console.log(error.response);
  }
};

//DELETE AN USER BY PARAMS ID
export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "User has been deleted" });
    } catch (error) {
      next(error);
    }
  } else {
    return next(createError(403, "You can update only on your account!"));
  }
};

// GET ALL THE USERS BY SAMPLES
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.aggregate([{ $sample: { size: 20 } }]);
    if (users.length == 0) {
      res.json({ message: "There is no Users yet" });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    return next(createError(403, "Something went wrong!"));
  }
};

//GET USER BY PARAMS ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.json({ message: "User do not exist" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    return next(createError(403, "This user does not exist!"));
  }
};

//LIKE A PALETTE
export const likeAPalette = async (req, res, next) => {
  const id = req.body.user.id;
  const paletteId = req.params.paletteId;
  const palette = await Palette.findById(paletteId);
  
  //If the palette has already been liked then the function pulls the userId from likes array.
  if (palette.likes.includes(id)) {
    await Palette.findByIdAndUpdate(paletteId, {
      $pull: { likes: id },
      $inc: {
        likesNumber: -1,
      },
    });
    res.status(201).json({ message: "Palette has been disliked" });
  } else {
    try {
      await Palette.findByIdAndUpdate(paletteId, {
        $addToSet: { likes: id },
        $inc: {
          likesNumber: 1,
        },
      });
      res.status(201).json({ message: "Palette has been liked" });
    } catch (error) {
      return next(createError(403, "Something went wrong!"));
    }
  }
};

// ADD/REMOVE A PALETTE FROM FAVORITES
export const addOrRemoveFromFavorites = async (req, res, next) => {
  const id = req.body.user.id;
  const paletteId = req.params.paletteId;
  const user = await User.findById(id);

  //If the palette is already added as a favourite then the function pulls the paletteId from the array.
  if (user.favs.includes(paletteId)) {
    await User.findByIdAndUpdate(id, {
      $pull: { favs: paletteId },
    });
    res
      .status(201)
      .json({ message: "Palette has been removed from favorites" });
  } else {
    try {
      await User.findByIdAndUpdate(id, {
        $addToSet: { favs: paletteId },
      });
      res.status(201).json({ message: "Palette has been added to favorites" });
    } catch (error) {
      return next(createError(403, "Something went wrong!"));
    }
  }
};

//GET FAVORITES

export const getFavorites = async (req, res, next) => {
  console.log(req.data)
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    const favoritesFromUser = user.favs;
    if (favoritesFromUser.length == 0) {
      res.status(201).json({ message: "Favorite section is empty" });
    } else {
      const list = await Promise.all(
        favoritesFromUser.map(async (id) => {
          return await Palette.find({ _id: id });
        })
      );

      return res.status(200).json(list.flat());
    }
  } catch (error) {
    res.status(500).json(error);
    next(error);
  }
};

//Get save palettes from user

export const getSavedPalettes = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const savedPalettes = await Palette.find({ userId: userId });

    if (savedPalettes.length == 0) {
      res.status(200).json({ message: "Palette store is empty" });
    } else {
      res.status(200).json(savedPalettes);
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    next();
  }
};

import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//REGISTER AN USER

export const signUp = async (req, res, next) => {
  //Existing user check
  //Hashed password
  // User creation
  // Token generate

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      email: email,
      name: name,
      password: hashedPassword,
    });

    res.status(201).json({ user: result, message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//LOGIN AN USER

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await findAndCheckExistingUser(email);

    if (!(await comparePasswords(password, existingUser))) {
      res.status(404).json({ message: "Invalid credentials" });
    } else {
      const token = await createToken(existingUser);

      res
        .cookie("access_token_weColor", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .status(201)
        .json({ user: existingUser, token: token, message: "User logged" });

      next();
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    next();
  }
};

const findAndCheckExistingUser = async (email) => {
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    res.status(404).json({ message: "User not found" });
  }

  return existingUser;
};

const comparePasswords = async (password, existingUser) => {
  const matchPassword = await bcrypt.compare(password, existingUser.password);

  return matchPassword;
};

const createToken = async (existingUser) => {
  const token = jwt.sign(
    { email: existingUser.email, id: existingUser._id },
    process.env.SECRET_KEY
  );

  return token;
};

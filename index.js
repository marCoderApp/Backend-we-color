import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import palettesRoutes from "./src/routes/palettes.route.js";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.routes.js";
import debug from "debug";

const app = express();
dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI); // debug

const connect = () => {
  mongoose
    .set("strictQuery", false)
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    .then(() => {
      console.log("connected to DB");
      console.log(process.env.MONGO_DB)
    })
    .catch((err) => {
      throw err;
    });
};

//MIDDLEWARES
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.65:5173","http://localhost:5174", "http://192.168.1.65:5174","http://127.0.0.1:5173","http://127.0.0.1:5174","https://wecolor.netlify.app",
      "http://192.168.1.68:5173"
    ],
    optionsSuccessStatus: 200,
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true,
    preflightContinue:false
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/palettes", palettesRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.get("/", (req, res) => {
  res.send("This server is Connected");
});

app.listen(process.env.PORT, () => {
  connect();
  debug("Conectado al server, puerto: 8500");
});

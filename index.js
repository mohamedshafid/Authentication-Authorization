// BASIC FOR EXPRESS APPLICATION.
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

// DOTENV CONFIG.
import dotenv from "dotenv";
dotenv.config();

// OTHER FILES IMPORTS.
import { dbConnect } from "./config/db.config.js";
import router from "./routes/user.route.js";
import passport from "./config/passport.config.js";
import MongoStore from "connect-mongo";

const app = express();

// DEFAULT MIDDLEWARES.
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a strong secret
    resave: false, // Prevents unnecessary session saving
    saveUninitialized: false, // Prevents saving empty sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session expires after 1 day
      secure: false, // Set to true in production with HTTPS
    },

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Connect to your DB
      ttl: 24 * 60 * 60, // 1 day expiry in DB
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ROUTES.
app.use("/api/v1/auth", router);

// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.send("Hello World");
});

// STARTING SERVER.
app.listen(process.env.PORT, () => {
  console.log("Server is running at port 3000");

  // CONNECTING TO DATABASE.
  dbConnect()
    .then(() => {
      console.log("Connected to database");
    })
    .catch(() => {
      console.log("Error in connecting to database");
    });
});

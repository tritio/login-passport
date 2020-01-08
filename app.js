const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const User = require("./models/User");

const bodyParser = require("body-parser");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const app = express();

app.use(
  session({
    secret: "passport-authentication",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, callback) => {
  console.log("SERIALIZADOR");
  callback(null, user);
});

passport.deserializeUser(async (id, callback) => {
  console.log("DESERIALIZADOR");

  try {
    const user = await User.findById(id);

    if (!user) return callback({ message: "El usuario no existe" });

    return callback(null, user);
  } catch (error) {
    console.log(error);
    return callback(error);
  }
});

app.use(flash());  // para gestionar errores
passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    async (req, username, password, next) => {
      console.log("LOCAL-STRATEGY");
      try {
        const user = await User.findOne({ username });

        if (!user)
          return next(null, false, { message: "El usuario no existe" });  // el primer parámetro sería el error si hubiese, el segundo el usuario, el último el mensaje

        if (!bcrypt.compareSync(password, user.password))
          return next(null, false, { message: "La contraseña no es correcta" });

        next(null, user);
      } catch (error) {
        next(error);
      }
    }
  )
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose
  .connect("mongodb://localhost:27017/passport-login", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Conectada base de datos en puerto 27017"))
  .catch(e => {
    throw e;
  });

module.exports = app;

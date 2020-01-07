const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => res.render("auth/signup"));

router.post("/", async (req, res) => {
  const { username, password, email, name } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) return res.render("signup", { error: "El usuario ya existe" });
  } catch (error) {
    res.render("signup", { message: "Hubo un error" });
  }

  try {
    const hashPass = bcrypt.hashSync(password, 10);

    const user = new User({ username, password: hashPass, email, name });

    await user.save();

    res.redirect("/auth/login");
  } catch (error) {
    res.render("signup", { error: "Hubo un error" });
  }
});

module.exports = router;

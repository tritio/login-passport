const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  //   const error = req.flash("error")[0];

  res.render("auth/login", { error: req.flash("error")[0] });
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  req.logOut();
  res.redirect("/auth/login");
});

module.exports = router;

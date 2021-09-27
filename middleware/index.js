const User = require("../models/user")

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash("error", "You need to be Logged in to do that.");
    return res.redirect("/login");
  }
}

module.exports = middlewareObj;
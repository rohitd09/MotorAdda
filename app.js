const express        = require("express")
      bodyParser     = require("body-parser")
      mongoose       = require("mongoose")
      flash          = require("connect-flash")
      path           = require("path")
      passport       = require("passport")
      nodemailer     = require("nodemailer")
      async          = require("async")
      crypto         = require("crypto")
      LocalStrategy  = require("passport-local")
      methodOverride = require("method-override")
      multer         = require("multer")
      app            = express();

      middleware      = require("./middleware")

      User            = require("./models/user")
      ParkingLocation = require("./models/parking_location")

mongoose.connect("mongodb://localhost/MotorAdda", { useNewUrlParser: true, useUnifiedTopology: true })

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
  secret: "Option",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => {
    res.render("landing")
})

app.post("/search_location", (req, res) => {
    var location = req.body.location
    res.redirect("/search_location/" + location)
})

app.get("/search_location/:location", (req, res) => {
  ParkingLocation.find({parking_spot_location: new RegExp(req.params.location, "i")}, (err, locationFound) => {
    if(err){
      console.log(err);
      res.redirect("/")
    } else {
      res.render("search_location", {locationFound: locationFound})
    }
  })
})

app.post("/decrease/:id/:spot", middleware.isLoggedIn, (req, res) => {
  spot = Number(req.params.spot) - 1
  if(spot < 0){
    res.redirect("/my_parkings")
  } else {
    ParkingLocation.findOneAndUpdate({_id: req.params.id}, {$set: {number_of_available_spots: spot}}, (err, inc) => {
      if(err){
        res.redirect("/my_parkings")
        req.flash("error", "Oops! There was an error")
      } else {
        res.redirect("/my_parkings")
      }
    })
  }
})


app.post("/increase/:id/:spot", middleware.isLoggedIn, (req, res) => {
  spot = Number(req.params.spot) + 1
  ParkingLocation.findOneAndUpdate({_id: req.params.id}, {$set: {number_of_available_spots: spot}}, (err, inc) => {
    if(err){
      res.redirect("/my_parkings")
      req.flash("error", "Oops! There was an error")
    } else {
      res.redirect("/my_parkings")
    }
  })
})

app.get("/my_parkings", middleware.isLoggedIn, (req, res) =>{
  ParkingLocation.find({parking_spot_owner: req.user.username}, (err, locationFound) => {
    if(err){
      console.log(err);
      res.redirect("/")
    } else {
      res.render("my_parkings", {locationFound: locationFound})
    }
  })
})

app.get("/add_location", middleware.isLoggedIn, (req, res) => {
  res.render("add_location")
})

app.post("/add_location", middleware.isLoggedIn, (req, res) => {
  var own_email     = req.body.owner_email
  var park_location = req.body.parking_location
  var address       = req.body.address
  var open_hour     = req.body.opening_hr
  var open_min      = req.body.opening_min
  var close_hour    = req.body.closing_hr
  var close_min     = req.body.closing_min
  var slots         = req.body.slots_available
  var spot_name     = req.body.spot_name

  new_location = new ParkingLocation({
    parking_spot_owner: own_email,
    parking_spot_name: spot_name,
    parking_spot_location: park_location,
    parking_spot_address: address,
    number_of_available_spots: slots,
    open_time: {
      hour: open_hour,
      minute: open_min
    },
    close_time: {
      hour: close_hour,
      minute: close_min
    }
  })

  new_location.save((err, ParkingLocation) => {
    if(err){
      console.log(err);
      res.redirect("/")
      req.flash("error", "Oops! There was an error")
    } else {
      req.flash("success", "Data Inserted Successfully")
      res.redirect("/my_parkings")
    }
  })
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){}
);

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password1, function(err, user){
    if(err){
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/register");
    }
  });

  res.redirect("/login");
});


app.listen(3000, () => {
    console.log("Server Started at port 3000");
})
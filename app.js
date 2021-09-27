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
  ParkingLocation.find({parking_spot_location: req.params.location}, (err, locationFound) => {
    if(err){
      console.log(err);
      res.redirect("/")
    } else {
      res.render("search_location", {locationFound: locationFound})
    }
  })
})

app.listen(3000, ()=>{
    console.log("Server Started at port 3000");
})
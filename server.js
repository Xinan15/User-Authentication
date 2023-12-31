if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Import libraries that we installed using npm

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

// Here we simply store all users in an array, but a robust app needs a database

// Check if the email passed in equals to the one in the database
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))


// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users); // Display newly registered in the console
    res.redirect("/login");
  } catch(e) {
    console.log(e);
    // alert("Registered Successfully, Redirecting to Login Page...");
    res.redirect("/register");
  }
});

// Routes
app.get('/', checkAuthenticated, (req, res) => {
  res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs")
})

// End outes

app.delete("/logout", (req, res) => {
  req.logout(req.user, err => {
      if (err) return next(err)
      res.redirect("/")
  })
})

function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next()
  }
  res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return res.redirect("/")
  }
  next()
}

app.listen(3000, () => console.log('Server started on port 3000'));
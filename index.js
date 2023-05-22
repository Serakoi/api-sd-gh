const express = require("express");
require("dotenv").config();
const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const session = require("express-session");

const app = express();

// ejs
app.set("view engine", "ejs");
app.use(express.static("public"));
// ejs folder
app.set("views", "./views");
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/gh-cb",
        },
        function (accessToken, refreshToken, profile, cb) {
            // console.log(profile, accessToken);
            cb(null, profile);
        }
    )
);

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            avatar_url: user?._json?.avatar_url || null,
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

app.get("/auth/github", passport.authenticate("github"));

app.get(
    "/gh-cb",
    passport.authenticate("github", { failureRedirect: "/auth/github" }),
    function (req, res) {
        // Successful authentication, redirect home.

        res.redirect("/");
    }
);

app.get("/gh-logout", (req, res) => {
    if (!req?.user) return res.redirect("/");
    req.logout((err) => {
        if (err) return res.send(err);

        return res.redirect("/");
    });
});

app.get("/", (req, res) => {
    return res.render("index", {
        user: req?.user,
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

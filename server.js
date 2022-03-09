const exp = require("express");
const app = exp();
const sequelize = require("sequelize");
const handlebars = require("express-handlebars");
const bodyparser = require("body-parser");
const multer = require("multer");

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
  destination: "./public/photos/",
  filename: function (req, file, cb) {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

app.use(bodyparser.urlencoded({ extended: false }));

app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

const seq_obj = new sequelize(
  "d859o4uj06kcru", //DATABASE NAME
  "pgffqaqcyonghm", // USERNAME
  "d8e1d771e900f2da05d0852c109075304558cd2bddadb90df77da12c59738f7c", // PASSWORD
  {
    host: "ec2-34-231-183-74.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: { ssl: { rejectUnauthorized: false } },
  }
);

// SQL: create table customers
const customers = seq_obj.define(
  "customers3",
  {
    id: {
      type: sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: sequelize.STRING,
    },
    fname: sequelize.STRING,
    lname: sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

var Project = seq_obj.define("Project", {
  title: sequelize.STRING,
  description: sequelize.TEXT,
});

const accounts = seq_obj.define("accounts", {
  fname: sequelize.STRING,
  lname: sequelize.STRING,
  phone: sequelize.INTEGER,
  username: sequelize.STRING,
  password: sequelize.STRING,
});

// { fname, lname, phone, username, password }

seq_obj.sync().then(function () {
  const port = process.env.PORT || 8080;
  app.listen(port);
});

app.get("/", (req, res) => {
  res.redirect("register");
});

app.get("/register", (req, res) => {
  //

  res.render("registration", {
    data: {},
    layout: false,
  });
});

app.post("/", upload.single("photo"), (req, res) => {
  console.log("post reuquest setn!", req.body);

  if (req.body["login-btn"]) return res.redirect("/login");

  const { fname, lname, phone, username, password } = req.body;

  let err = [];

  if (!fname) err.push({ msg: "Please include first name" });
  if (!lname) err.push({ msg: "Please include last name" });
  if (!phone) err.push({ msg: "Please include phone number" });
  if (!username) err.push({ msg: "Please include username" });
  if (!password) err.push({ msg: "Please include password" });

  var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (format.test(username))
    err.push({ msg: "Username must not contain special character" });

  if (username && (username.length < 6 || username.length > 12))
    err.push({
      msg: "Username must be between 6 to 12 characters",
    });

  if (phone && !/^[0-9]*$/.test(phone))
    err.push({
      msg: "Phone number must only contain number",
    });

  if (!err.length) {
    // const accounts = seq_obj.define("accounts", {
    //     fname: sequelize.STRING,
    //     lname: sequelize.STRING,
    //     phone: sequelize.NUMBER,
    //     username: sequelize.STRING,
    //     password: sequelize.STRING,
    //   });

    accounts
      .create({
        fname,
        lname,
        phone: parseInt(phone),
        username,
        password,
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch(() => {
        res.render("registration", {
          data: {
            error: [{ msg: "Something went wrong!" }],
            vals: { fname, lname, phone, username, password },
          },
          layout: false,
        });
      });
  } else {
    res.render("registration", {
      data: { error: err, vals: { fname, lname, phone, username, password } },
      layout: false,
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login", {
    data: {},
    layout: false,
  });
});

app.post("/login", upload.single("photo"), (req, res) => {
  console.log("show body: ", req.body);

  if (req.body["register-btn"]) return res.redirect("/register");

  const { username, password } = req.body;

  res.render("login", {
    data: { vals: { username, password } },
    layout: false,
  });
});

app.get("/dashboard", (req, res) => {});

seq_obj
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

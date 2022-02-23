const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const multer = require("multer");
const path = require("path");

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: "./public/photos/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

let accounts = [];

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  console.log("go go!");
  res.sendFile(__dirname + "/home.html");
});

// app.get("/abc", (req, res) => {
//   console.log("go gofdsfdsafdsafsda!");
//   // res.sendFile(__dirname + "/home.html");
// });

app.post("/registration", upload.single("photo"), (req, res) => {
  console.log("hello world", req.body);

  console.log("hello this type> ", req.body.fname);

  const { fname, lname, username, password, phone } = req.body;

  let errorMsg = "";

  if (fname == "")
    errorMsg += `<div class="error-form">Please include first name</div>`;
  if (lname == "")
    errorMsg += `<div class="error-form">Please include last name</div>`;
  if (username == "")
    errorMsg += `<div class="error-form">Please include username</div>`;
  if (phone == "")
    errorMsg += `<div class="error-form">Please include phone number</div>`;
  if (password == "")
    errorMsg += `<div class="error-form">Please include password</div>`;

  // if (fname == "")
  //   errorMsg += `<div class="error-form">Please include first name</div>`;

  if (!/^[a-zA-Z0-9]{6,12}$/.test(username))
    errorMsg += `<div class="error-form">Username must be between 6 to 12 characters and not include special character</div>`;

  if (!/^\d+$/.test(phone))
    errorMsg += `<div class="error-form">Phone number must only contain number</div>`;

  if (!/^[a-zA-Z0-9_.-]*$/.test(password))
    errorMsg += `<div class="error-form">Password must contain letter and numbers only</div>`;

  // console.log("show all data obtained!", { fname, lname, username, password });

  if (!errorMsg) {
    accounts.push({ fname, lname, username, password, phone });
  }

  res.send(`
  <!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="web322.css" />

    <title>WEB322</title>
    <style>
      .error-form {
        color: red;
      }
    </style>
  </head>
  <body>
    ${errorMsg}

    <!-- <form onSubmit="return sendRequest;"> -->
    <form action="/registration" method="POST" enctype="multipart/form-data">
      <label for="fname">First name:</label><br />
      <input type="text" id="fname" name="fname" value="${fname}" /><br />
      <label for="lname">Last name:</label><br />
      <input type="text" id="lname" name="lname" value="${lname}" /><br /><br />

      <label for="phone">Phone:</label><br />
      <input type="text" id="phone" name="phone" value="${phone}" /><br /><br />

      <label for="username">Username</label><br />
      <input
        type="text"
        id="username"
        name="username"
        value="${username}"
      /><br /><br />
      <label for="password">Password:</label><br />
      <input
        type="password"
        id="password"
        name="password"
        value="${password}"
      /><br /><br />

      <input type="submit" value="Submit" />
    </form>
  </body>
</html>

  `);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

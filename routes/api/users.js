const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

//@route     /api/users -> Create an User
//@desc      POST route
//@access    PUBLIC
router.post(
  "/",
  [
    check("username", "Username is requied").not().isEmpty(),
    check("squadname", "Squadname is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
    check("password", "Minimum Length is 6 character").isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log("Registering an User : Received->", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, squadname, password } = req.body;

    try {
      //Check if username is available
      let user = await User.findOne({ username });
      if (user) {
        console.log("Username exists!");
        return res.status(400).json({ error: "Username exists!" });
      } else {
        console.log("It's a new username");
      }

      //Check if squadname is available
      let squad = await User.findOne({ squadname });
      if (squad) {
        console.log("Squadname exists!");
        return res.status(400).json({ error: "Squadname exists!" });
      } else {
        console.log("It's a new squadname");
      }

      //Create instance of a new user
      let newUser = new User({
        username,
        squadname,
        password,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      console.log("Hashed password", newUser.password);

      //Create the user
      await newUser.save();
      console.log("User is added in DB");

      //Return jsonwebtoken and auto log-in User
      const payload = {
        user: {
          id: newUser.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || config.get("jwtSecret"),
        { expiresIn: "3600s" },
        (err, token) => {
          if (err) {
            console.log("JWT Sign error", err);
            throw err;
          }
          return res.json({ token });
        }
      );
    } catch (error) {
      console.log("Error while registering User", error.message);
      return res.status(500).send("Server Error");
    }
  }
);

//@route     /api/users/all -> Get all the users
//@desc      GET route
//@access    PRIVATE
router.get("/all", auth, async (req, res) => {
  try {
    const allUsers = await User.find();
    if (allUsers) return res.json({ users: allUsers });
    else return res.status(400).send("No users found!");
  } catch (error) {
    console.log("Error while getting all the users", error.message);
    return res.status(500).send("Server Error");
  }
});

//@route     /api/users/ -> delete an user
//@desc      DELETE route
//@access    PRIVATE
router.delete("/", auth, async (req, res) => {
  console.log("Delete this user ->", req.body);
  let { username } = req.body;
  try {
    const deleteUser = await User.findOneAndDelete({ username });
    if (deleteUser) return res.send("User is deleted");
    else return res.status(400).send("No User found!");
  } catch (error) {
    console.log("Error while deleting the user", error.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;

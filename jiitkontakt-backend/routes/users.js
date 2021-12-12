const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { Promise } = require("mongoose");
// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
      } catch (err) {
        res.json({ message: err });
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json({ message: "User updated", user });
    } catch (err) {
      res.json({ message: err });
    }
  } else {
    return res.status(403).json("You Can Update only your own profile");
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "User deleted", user: other });
    } catch (err) {
      res.json({ message: err });
    }
  } else {
    return res.status(403).json("You Can delete only your own profile");
  }
});
// get all user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json({ other });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});
// follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $push: { following: req.params.id },
        });
        res.status(200).json({ message: "User followed" });
        return;
      }
      user.following.push(currentUser._id);
      await user.save();
      res.status(200).json({ message: "User followed", user });
    } catch (err) {
      res.json({ message: err });
      return;
    }
  } else {
    res.status(403).json({ message: "You can't follow yourself" });
    return;
  }
});

// get friends list
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.following.map(async (following) => {
        return User.findById(following);
      })
    );
    var friendslist = [];

    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendslist.push({ _id, username, profilePicture });
    });

    res.status(200).json({ friendslist });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $pull: { following: req.params.id },
        });
        res.status(200).json({ message: "User unfollowed" });
      }
      user.following.push(currentUser._id);
      await user.save();
      res.status(200).json({ message: "User unfollowed", user });
    } catch (err) {
      res.json({ message: err });
    }
  } else {
    res.status(403).json({ message: "You can't unfollow yourself" });
    return;
  }
});

module.exports = router;

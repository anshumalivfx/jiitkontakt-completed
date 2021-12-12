const { Promise } = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

const router = require("express").Router();

// create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(400).send(err);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json(post);
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("deleted");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
// like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("the post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("the post has been unliked");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).send(err);
  }
});
// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  // try {
  //   const currentUser = await User.findById(req.params.userId);
  //   const userposts = await Post.find({
  //     userId: { $in: currentUser._id },
  //   });
  //   const friendsposts = await Post.find({
  //     userId: { $in: currentUser.followings }
  //   });
  //   res.status(200).json(userposts.concat(friendsposts));
  // } catch (err) {
  //   res.status(500).send(err);
  // }
  try {
    const currentUser = await User.findById(req.params.userId);
    const userposts = await Post.find({
      userId: { $in: currentUser._id },
    });
    const friendsposts = await Promise.all(
      currentUser.following.map((friend) => {
        return Post.find({ userId: friend });
      })
    );

    res.status(200).json(userposts.concat(...friendsposts));
  } catch (err) {
    res.status(500).send(err);
  }
});

// get user's posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Post = require("./models/post");

// import authentication library
const auth = require("./auth");
const ObjectID = require('mongodb').ObjectID;

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socket = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});


router.post("/submitPost", (req, res) => {
  const newPost = new Post({
    user: req.body.user,
    title: req.body.title,
    text: req.body.text,
  })
  newPost.save().then((post) => {
    res.send(post);
  })
});

router.post("/deletePost", (req, res) => {
  Post.deleteOne({"_id": ObjectID(req.body.id)}).then((post) => res.send(post));
})

router.post("/updatePost", (req, res) => {
  Post.replaceOne({"_id": ObjectID(req.body.id)}, 
  {"user": req.body.user, "title": req.body.title, "text": req.body.text, "timestamp": req.body.timestamp}).then((post) => 
    res.send(post));
})

router.get("/retrievePosts", (req, res) => {
  Post.find({"user": req.query.user}).then((posts) => {
    res.send(posts);
  });
})

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

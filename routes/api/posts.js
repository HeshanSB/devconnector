const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Load validator
const validatePostInput = require('../../validation/post');

router.get('/test', (req,res) => res.json({ msg: "Posts Works"}));

// GET api/posts/
router.get('/', (req,res)=>{
    Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({noPostsFound: 'no posts found'}));
});

// GET api/posts/:id
router.get('/:id',(req,res)=>{
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({noPostFound: 'no post found'}));
});

// POST api/posts/
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = validatePostInput(req.body);
  
      // Check Validation
      if (!isValid) {
        return res.status(400).json(errors);
      }
  
      const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      });
  
      newPost.save().then(post => res.json(post));
    }
  );

//POST /api/posts/like/:id
router.post('/like/:id', passport.authenticate('jwt',{session:false}),(req,res)=>{
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then( post => {
      if(
        post.likes.filter(like => like.user.toString() === req.user.id).length>0){
          return res.status(400).json({alreadyLiked : "User already liked to this post"});
        }
      post.likes.unshift({user: req.user.id});
      post.save().then(post => res.json(post));
    });
  }).catch(err=> res.status(404).json({postNotFound: 'No post found'}));
});

//POST /api/posts/disllike/:id
router.post('/dislike/:id', passport.authenticate('jwt',{session: false}), (req,res)=>{
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then(post =>{
      if(
        post.likes.filter(like => like.user.toString() === req.user.id).length==0){
          return res.status(400).json({noLiked: "This user not liked to this post"});
        }
      const removeIndex = post.likes.map(item => item.user.toString())
      .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);
      post.save().then(post=> res.json(post));
    }).catch(err => res.status(404).json({postNotFound: "No post found"}));
  });
});

//DELETE /api/posts/:id
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);

module.exports  = router;
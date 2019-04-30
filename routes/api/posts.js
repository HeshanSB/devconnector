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

//DELETE /api/posts/:id
router.delete('/:id', passport.authenticate('jwt',{session: false}),(req, res)=>{
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({noAuthorized: "User not authorized"});
            }
            post.remove().then(() =>res.json({sucess : true}));
        }).catch(err => res.status(404).json({ postNotFound: 'No post found'}));
    });
});

module.exports  = router;
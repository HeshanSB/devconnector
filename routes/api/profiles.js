const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load input validation
const validateProfileInput = require('../../validation/profile');
//load profile model
const Profile = require('../../models/Profile');
//load user profile
const User = require('../../models/User');    

router.get('/test', (req,res) => res.json({ msg: "Profile Works"}));

//Get api/profile
router.get('/', passport.authenticate('jwt', {session: false}), (req, res)=>{
    const errors = {};
    Profile.findOne({user: req.user.id})
    .then( profile => {
        if(!profile){
            errors.noprofile = 'Therer is no profile';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch( err => res.status(404).json(err));
});

//POST api/profile
router.post('/', passport.authenticate('jwt', {session: false}), (req, res)=>{
    const {errors , isValid} = validateProfileInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    //split skills
    if(typeof req.body.skills !== undefined){
        profileFields.skills = req.body.skills.split(',');
    }
    //Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    //find profile exist or not
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        //Update
        if(profile){
            Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields},{new: ture})
            .then(profile => res.json(profile));
        }
        //Create
        else{
            // find handle exist or not
            Profile.findOne({handle: profileFields.handle})
            .then(profile => {
                if(profile){
                    errors.handle = "That handle already exist";
                    res.status(404).json(errors)
                }
                new Profile(profileFields).save()
                .then(profile => res.json(profile));
            });
        }
    });
});

module.exports  = router;
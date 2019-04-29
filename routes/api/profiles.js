const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load input validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');
//load profile model
const Profile = require('../../models/Profile');
//load user model
const User = require('../../models/User');    

router.get('/test', (req,res) => res.json({ msg: "Profile Works"}));

//GET api/profile/all
router.get('/all', (req,res)=>{
    const errors = {};
    Profile.find()
    .populate('user',['name', 'avatar'])
    .then(profiles => {
        if(!profiles){
            errors.noprofile = "There are no profiles";
            res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err => res.json({noprofile : 'There are no profiles for this users'}));
});

//GET api/profile/handle/:handle
router.get('/handle/:handle', (req, res)=>{
    const errors = {};

    Profile.findOne({handle: req.params.handle})
    .populate('user', ['name','avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = "There is no profile";
            res.status(404).json(errors);
        }
        res.json(profile);
    }).catch(err => res.status(404).json(err));

});

//GET api/profile/user/:user_id
router.get('/user/:user_id', (req, res)=>{
    const errors = {};

    Profile.findOne({user: req.params.user_id})
    .populate('user', ['name','avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = "There is no profile";
            res.status(404).json(errors);
        }
        res.json(profile);
    }).catch(err => res.status(404).json({profile: "There is no profile for this user"}));

});

//Get api/profile
router.get('/', passport.authenticate('jwt', {session: false}), (req, res)=>{
    const errors = {};
    Profile.findOne({user: req.user.id})
    .populate('user',['name','avatar'])
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
            Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields},{new: true})
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

//POST api/profile/experience
router.post('/experience', passport.authenticate('jwt',{session: false}), (req, res) =>{

    const {errors, isValid} = validateExperienceInput(req.body);

    if(!isValid){
        return res.status(404).json(errors);
    }
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEx = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current : req.body.current,
            decription: req.body.decription
        };
        profile.experience.unshift(newEx);
        profile.save()
        .then(profile => res.json(profile));
    });
});

//POST api/profile/education
router.post('/education', passport.authenticate('jwt',{session: false}), (req, res) =>{

    const {errors, isValid} = validateEducationInput(req.body);

    if(!isValid){
        return res.status(404).json(errors);
    }
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current : req.body.current,
            decription: req.body.decription
        };
        profile.education.unshift(newEdu);
        profile.save()
        .then(profile => res.json(profile));
    });
});

//DELETE api/profile/experience/:exp_id
router.delete('/experience/:exp_id', passport.authenticate('jwt',{session: false}), (req,res)=>{

    Profile.findOne({user: req.user.id})
    .then(profile =>{
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        //Splice out of Array
        profile.experience.splice(removeIndex, 1);

        //save
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

//DELETE api/profile/education/:edu_id
router.delete('/education/:edu_id', passport.authenticate('jwt',{session: false}), (req,res)=>{

    Profile.findOne({user: req.user.id})
    .then(profile =>{
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        //Splice out of Array
        profile.education.splice(removeIndex, 1);

        //save
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

//DELETE api/profile
router.delete('/', passport.authenticate('jwt',{session: false}), (req,res)=>{
    
    Profile.findOneAndRemove({user: req.user.id})
    .then(() => {
        User.findOneAndRemove({_id: req.user.id})
        .then(() => res.json({sucess: true}));
    });
});

module.exports  = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

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

module.exports  = router;
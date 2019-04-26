const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profiles');
const posts = require('./routes/api/posts');


const app = express();

// Config database
const db = require('./config/keys').mongoURI;

// mongoose connect
mongoose.connect(db,{useNewUrlParser:true})
.then(()=> console.log('MongoDB Connected'))
.catch((err)=>console.log(err));

app.get('/',(req,res) => res.send('Hello!!'));

// Use routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
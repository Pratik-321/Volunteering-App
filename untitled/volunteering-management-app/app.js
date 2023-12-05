const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose').default; // Import mongoose for database integration
const path = require('path'); // Import path for file path handling
const ejs =require("ejs");
var findOrCreate= require('mongoose-findorcreate');
const GoogleStrategy=require("passport-google-oauth").OAuth2Strategy;
const session =  require('express-session');
const passport=require("passport");
const app = express();
const PORT = process.env.PORT || 3001;
const nodemailer = require('nodemailer');

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET"
}));

app.use(passport.initialize());
app.use(passport.session());
// Serve static files from the "frontend" directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Connect to MongoDB (replace the URL and database name with your own)
mongoose.connect('mongodb://127.0.0.1:27017/Volunteering_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Define the Event schema
passport.serializeUser(function(user, cb) {
    cb(null, user);});
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: "1019854456796-9mbrvt0s9v0uiqqgq801cou3j8kqc909.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3001/auth/google/secret"},
function(token, tokenSecret, profile,done) {
    Users.findOrCreate({userId: profile.id, name: profile.displayName}, function (err, user) {
        return done(err, user);

    });
}
));
app.get("/auth/google",
    passport.authenticate('google', { scope: ["https://www.googleapis.com/auth/plus.login"] })
);

app.get("/auth/google/secret",
passport.authenticate("google", {failureRedirect: "/" }),
function(req, res) {
    res.redirect("/events.html");
});

app.get('/login.html', function(req, res){
    if (req.isAuthenticated()) {
        res.redirect("/events.html"); // Redirect to events page if logged in
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html')); // Show login page if not logged in
    }
});

app.get('/create-account.html', function(req, res) {
    if (req.isAuthenticated()){
        res.redirect("/events.html"); // Redirect to events page if logged in
    } else {
        res.sendFile(path.join(__dirname, 'create-account.html')); // Show create account page if not logged in
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pratikbhattacharya61@gmail.com',
    pass: 'vdwm wxdb wqsr jqnr'
  }
});
app.listen(3808,function(req, res) {
    console.log("running on 1000");
    const eventSchema = new mongoose.Schema({
        name: String,
        date: String,
        locations: String,
        volunteersNeeded: String,
        imageUrl: String,
        details: String,
        category: String,
    });

// Create the Event model
    const Event = mongoose.model('Event', eventSchema);

// Routes
// Get all events
    app.get('/api/events', async (req, res) => {
        try {
            const events = await Event.find();
            res.json(events);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: 'Internal server error'});
        }
    });

// Add a new event
    app.post('/api/events', async (req, res) => {
        const newEvent = new Event(req.body);

        try {
            await newEvent.save();
            res.status(201).json(newEvent);
        } catch (err) {
            console.error(err);
            res.status(400).json({error: 'Invalid data'});
        }
    });


    const volunteerSchema = new mongoose.Schema({
        name: String,
        email: String,
        phone: String,
        gender: String,
        age: Number,
        address: String
    });

    const Volunteer = mongoose.model('Volunteer', volunteerSchema);
    const nodemailer = require('nodemailer');

// Add a new volunteer
    app.post('/api/volunteers', async (req, res) => {
//  //const volunteerId = req.body.volunteerId;

 
    // Check if the maximum limit is reached

        const newVolunteer = new Volunteer(req.body);
         const volunteerEmail = req.body.email;
          const mailOptions = {
        from: 'pratikbhattacharya61@gmail.com',
        to: volunteerEmail,
              subject: 'Registration Confirmation',
        text: 'You are registered for the event. Event details and instructions will be provided.'
  };
           transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email: ' + error);
      res.status(500).json({ error: 'Email sending failed' });
    } else {
      console.log('Email sent: ' + info.response);
      res.json({ message: 'Email sent successfully' });
    }
  });
        try {
            await newVolunteer.save();
            res.status(201).json(newVolunteer);
        } catch (err) {
            console.error(err);
            res.status(400).json({error: 'Invalid data'});
        }

    });

    // Send a response to the frontend


    const AddeventSchema = new mongoose.Schema({
        name: String,
        date: String,
        locations: String,
        volunteersNeeded: String,
        imageUrl: String,
        details: String,
        category: String,
    });

    const AddEvent = mongoose.model('Event-Add', AddeventSchema);

// Add a new event
    app.post('/api/Add-events', async (req, res) => {
        const newEvent = new Event(req.body);

        try {
            await newEvent.save();
            res.status(201).json(newEvent);
        } catch (err) {
            console.error(err);
            res.status(400).json({error: 'Invalid data'});
        }
    });

// Define the User schema
    const userSchema = new mongoose.Schema({
        username: String,
        password: String,
        role: String, // 'admin' or 'volunteer
        // role: String, // Add a role field for user type
    });

// Create the User model
    const User = mongoose.model('User', userSchema);
    app.post('/api/create-account', (req, res) => {
        const {username, password} = req.body;

        // Create a new user and save it to the database
        const newUser = new User({username, password});

        newUser.save()
            .then(() => {
                // Redirect to the 'event.html' page
                res.status(201).redirect('/events.html');
            })
            .catch((err) => {
                res.status(500).json({success: false, message: 'Error creating account'});
            });
    });


    app.post('/api/login', async (req, res) => {
        const {username, password} = req.body;

        // Check the database for the user
        User.findOne({username, password})
            .then((user) => {
                if (user) {
                    res.json({success: true, message: 'Login successful'});
                } else {
                    res.status(401).json({success: false, message: 'Incorrect username or password'});
                }
            })
            .catch((err) => {
                res.status(500).json({success: false, message: 'An error occurred during login.'});
            });
    });


// ... Other routes ...

// Route for events.html
    app.get('/events.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'events.html'));
    });

    app.get('/about-us.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'about-us.html'));
    });


    app.get('/contact-us.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'contact-us.html'));
    });

    app.get('/faq-help.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'faq-help.html'));
    });

    app.get('/volunteer-registration.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'volunteer-registration.html'));
    });

    app.get('/background-events.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'volunteer-registration.html'));
    });
    app.get('/create-account.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'create-account.html'));
    });
    app.get('/login.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
    });
// Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

});
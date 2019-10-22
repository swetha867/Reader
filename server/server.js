const express = require('express');
const app = express();
const port = 6010;
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const userController = require('./routes/user');
const lookupController = require('./routes/lookup');
const votingController = require('./routes/vote');
const pageController = require('./routes/page');
const learningController = require('./routes/learning');
const instController = require('./routes/inst');
const authController = require('./routes/auth');





//logging
var morgan = require('morgan')
app.use(morgan('tiny'))

app.set('view engine', 'ejs');
app.set('views', './views');



// Auth
// use express session
app.use(
  session({
    secret: 'KoobProject123',
    saveUninitialized: false,
    resave: false,
  }),
);

require('./config/passport.js')(app);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    done(null, id);
});

function authProtectInst(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.isTeacher !== 1) {
        res.redirect('/auth/logout');
      } else {
        next();
      }
    } else {
      res.redirect('/auth/login');
    }
  }


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', userController);
app.use('/lookup', lookupController);
app.use('/votes', votingController);
app.use('/page', pageController);
app.use('/learning', learningController);
app.use('/instructor', authProtectInst, instController);
app.use('/auth/', authController);

app.get('/', (req,res) => {
    res.send('Hello world');
});

app.listen(port,  () => {
    console.log(`My express server is running at ${port}!`);
});

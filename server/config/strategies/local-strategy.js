const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../../model/user.js');
const debug = require('debug')('app:local-strategy');

const strategy = new LocalStrategy(
  ((email, student_id, done) => {
    const isValid = User.checkValid(email, student_id);
    isValid.then((res) => {
      if (res != false) {
        return done(null, res);
      }
      return done(null, false, { message: 'Invalid email or student id.'});
    });
  }),
);

module.exports = () => {
  passport.use(strategy);
};
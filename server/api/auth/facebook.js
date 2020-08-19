const passport = require('passport');
const passportFacebook = require('passport-facebook');

const radix = 10;
const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
const rootUrl = process.env.REACT_APP_CANONICAL_ROOT_URL;

const FacebookStrategy = passportFacebook.Strategy;

const callbackURL = `http://localhost:${PORT}/api/auth/facebook/callback`;
console.log('callback url', callbackURL);

const strategyOptions = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  // TODO don't use hard-coded url
  callbackURL,
  profileFields: ['id', 'displayName', 'name', 'emails'],
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log('profile:', profile);

  const { email, first_name, last_name } = profile._json;
  const userData = {
    email,
    firstName: first_name,
    lastName: last_name,
  };

  // TODO: Handle checking user in Flex API?
  const user = userData;

  done(null, profile);
};

passport.use(new FacebookStrategy(strategyOptions, verifyCallback));

exports.authenticateFacebook = passport.authenticate('facebook', { scope: ['email'] });

exports.authenticateFacebookCallback = passport.authenticate('facebook', {
  session: false,
  successRedirect: `${rootUrl}/#`,
  failureRedirect: `${rootUrl}/login`,
});

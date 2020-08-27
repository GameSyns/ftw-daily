const passport = require('passport');
const passportFacebook = require('passport-facebook');
const { getTrustedSdk } = require('../../api-util/sdk');

const radix = 10;
const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
const rootUrl = process.env.REACT_APP_CANONICAL_ROOT_URL;
const clientID = process.env.FACEBOOK_APP_ID;
const clientSecret = process.env.FACEBOOK_APP_SECRET;

const FacebookStrategy = passportFacebook.Strategy;

const callbackURL = `http://localhost:${PORT}/api/auth/facebook/callback`;

const strategyOptions = {
  clientID,
  clientSecret,
  callbackURL,
  profileFields: ['id', 'displayName', 'name', 'emails'],
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  const { email } = profile._json;
  const userData = {
    email,
    accessToken,
    refreshToken,
  };

  done(null, userData);
};

passport.use(new FacebookStrategy(strategyOptions, verifyCallback));

exports.authenticateFacebook = passport.authenticate('facebook', { scope: ['email'] });

// exports.authenticateFacebookCallback = passport.authenticate('facebook', {
//   session: false,
// });

exports.authenticateFacebookCallback = (req, res, next) => {
  passport.authenticate('facebook', function(err, user, info) {
    if (err || !user) {
      return res.redirect(`${rootUrl}/login#fail`);
    }

    const trustedSdk = getTrustedSdk(req, true);
    trustedSdk
      .authWithIdp({
        idpClientId: `${clientID}`,
        idpToken: `${user.accessToken}`,
      })
      .then(response => {
        console.log('OMG Response', response);
        res.redirect(`${rootUrl}/#success`);
      })
      .catch(e => {
        res.redirect(`${rootUrl}/login#flex-fail`);
        console.log('OMG error', e);
      });
  })(req, res, next);
};

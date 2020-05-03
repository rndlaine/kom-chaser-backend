const strava = require('../agents/strava');

const checkIsAuthValid = async (headers, userId) => {
  const auth = headers.authorization;
  const token = auth.substring(7, auth.length);

  const profile = await strava.getProfile(token);
  return profile.id === userId;
};

const checkIsAuthenticated = async (headers) => {
  const auth = headers.authorization;
  const token = auth.substring(7, auth.length);

  try {
    const profile = await strava.getProfile(token);

    return !!profile;
  } catch (e) {
    return false;
  }
};

module.exports = { checkIsAuthValid, checkIsAuthenticated };

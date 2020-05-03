const axios = require('axios');

const getHeaders = (accessToken) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
  crossDomain: true,
});

const getActivities = async (accessToken) => {
  const limit = 200;
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    throw 'Unable to connect to strava';
  }
};

const getActivity = async (accessToken, id) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/activities/${id}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    throw 'Unable to connect to strava';
  }
};

const getEquipment = async (accessToken, id) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/gear/${id}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    throw 'Unable to connect to strava';
  }
};

module.exports = { getEquipment, getActivities, getActivity };

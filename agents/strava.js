const axios = require('axios');
const promiseDebounce = require('../axios-queue/promiseDebounce');

axios.get = promiseDebounce(axios.get, 1600, 1);

const getHeaders = (accessToken) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
  crossDomain: true,
});

const getProfile = async (accessToken) => {
  try {
    const result = await axios.get('https://www.strava.com/api/v3/athlete', getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

const getActivities = async (accessToken) => {
  const limit = 200;
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

const getActivity = async (accessToken, id) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/activities/${id}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

const getSegment = async (accessToken, id) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/segments/${id}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

const getEquipment = async (accessToken, id) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/gear/${id}`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

const getLeaderboard = async (accessToken, segmentid) => {
  try {
    const result = await axios.get(`https://www.strava.com/api/v3/segments/${segmentid}/leaderboard`, getHeaders(accessToken));

    return result.data;
  } catch (e) {
    console.log('e: ', e.message);
    throw 'Unable to connect to strava';
  }
};

module.exports = { getSegment, getProfile, getLeaderboard, getEquipment, getActivities, getActivity };

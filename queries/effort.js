const mPolyline = require('@mapbox/polyline');
const lodash = require('lodash');
const { pool } = require('./pool');
const { getKOMRating } = require('../helpers/KOMRatingHelpers');
const { getDistance } = require('../helpers/coordinateHelpers');

const getKOMRatings = async (rows) => {
  const segments = await pool.query('SELECT * FROM segment', []);

  return rows.map((item) => {
    const segment = segments.rows.find((x) => x.id === item.segmentid) || {};
    return { ...item, ...getKOMRating(item, segment), city: segment.city };
  });
};

const getSegmentEffortsByActivity = async (request, response) => {
  const activityId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE activityid = $1', [activityId], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows));
  });
};

const getSegmentEffortsByUser = async (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE userid = $1', [userId], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows));
  });
};

const getBestSegmentEffortsByUser = async (request, response) => {
  const userId = parseInt(request.params.id);

  const activitiesResult = await pool.query('SELECT * FROM activity WHERE userid = $1', [userId]);
  pool.query('SELECT * FROM segmenteffort WHERE segmenteffort.userid = $1', [userId], async (error, results) => {
    if (error) throw error;

    const filteredResults = results.rows.filter((row) => {
      const activity = activitiesResult.rows.find((activity) => activity.id === row.activityid);
      return activity.type !== 'VirtualRide';
    });

    const updatedEfforts = await getKOMRatings(filteredResults);
    const sortedEfforts = lodash.sortBy(updatedEfforts, (effort) => effort.komScore);
    const uniqueEfforts = lodash.uniqBy(sortedEfforts.reverse(), (item) => item.segmentid);

    response.status(200).json(uniqueEfforts.slice(0, 100));
  });
};

const getSegmentEffortsBySegment = async (request, response) => {
  const segmentid = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE segmentid = $1', [segmentid], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows));
  });
};

const getSegmentEffort = async (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE id = $1', [id], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows)[0]);
  });
};

const getClosestSegmentEffortsByUser = async (request, response) => {
  const userId = parseInt(request.params.id);
  const userLat = parseFloat(request.params.lat);
  const userLon = parseFloat(request.params.lon);

  pool.query('SELECT * FROM segmenteffort WHERE segmenteffort.userid = $1', [userId], async (error, results) => {
    if (error) throw error;

    const efforts = results.rows;
    const closestResults = [];
    let i;

    for (i = 0; i < efforts.length; i++) {
      const effort = efforts[i];
      const segmentResults = await pool.query('SELECT * FROM segment WHERE id = $1', [effort.segmentid]);
      const segment = segmentResults.rows[0];
      const polyline = mPolyline.decode(segment.polyline);
      const firstCoords = polyline[0];

      const distance = getDistance(userLat, userLon, firstCoords[0], firstCoords[1]);

      if (distance < 20) {
        closestResults.push(effort);
      }
    }

    const updatedEfforts = await getKOMRatings(closestResults);
    const sortedEfforts = lodash.sortBy(updatedEfforts, (effort) => effort.komScore);
    const uniqueEfforts = lodash.uniqBy(sortedEfforts.reverse(), (item) => item.segmentid);

    response.status(200).json(uniqueEfforts.slice(0, 100));
  });
};

module.exports = {
  getClosestSegmentEffortsByUser,
  getBestSegmentEffortsByUser,
  getSegmentEffortsBySegment,
  getSegmentEffort,
  getSegmentEffortsByUser,
  getSegmentEffortsByActivity,
};

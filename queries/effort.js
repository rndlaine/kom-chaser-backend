const lodash = require('lodash');
const { pool } = require('./pool');
const { getKOMRating } = require('../helpers/KOMRatingHelpers');

const getKOMRatings = async (rows) => {
  const leaderboards = await pool.query('SELECT * FROM leaderboard', []);
  const segments = await pool.query('SELECT * FROM segment', []);

  return rows.map((item) => {
    const board = leaderboards.rows.find((leaderboard) => leaderboard.segmentid === item.segmentid && leaderboard.rank === '1');
    const segment = segments.rows.find((x) => x.id === item.segmentid) || {};

    return { ...item, ...getKOMRating(item, board), city: segment.city };
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

  pool.query('SELECT * FROM segmenteffort WHERE userid = $1', [userId], async (error, results) => {
    if (error) throw error;

    const updatedEfforts = await getKOMRatings(results.rows);
    const sortedEfforts = lodash.sortBy(updatedEfforts, (effort) => effort.komScore);
    const uniqueEfforts = lodash.uniqBy(sortedEfforts.reverse(), (item) => item.segmentid);

    response.status(200).json(uniqueEfforts.slice(0, 100));
  });
};

const getSegmentEffortsBySegment = (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE segmentid = $1', [userId], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows));
  });
};

const getSegmentEffort = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE id = $1', [id], async (error, results) => {
    if (error) throw error;

    response.status(200).json(await getKOMRatings(results.rows)[0]);
  });
};

const createSegmentEffort = (request, response) => {
  const { id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts } = request.body;

  pool.query(
    'INSERT INTO segmenteffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts],
    (error, results) => {
      if (error) throw error;

      response.status(201).send(`SegmentEffort added with ID: ${id}`);
    },
  );
};

module.exports = { getBestSegmentEffortsByUser, getSegmentEffortsBySegment, getSegmentEffort, createSegmentEffort, getSegmentEffortsByUser, getSegmentEffortsByActivity };

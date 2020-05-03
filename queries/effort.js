const { pool } = require('./pool');

const getSegmentEffortsByActivity = (request, response) => {
  const activityId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE activityid = $1', [activityId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getSegmentEffortsByUser = (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE userid = $1', [userId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getSegmentEffort = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createSegmentEffort = (request, response) => {
  const {
    id,
    userId,
    segmentId,
    activityId,
    elapsed_time,
    start_date,
    distance,
    is_kom,
    name,
    moving_time,
    average_watts,
  } = request.body;

  pool.query(
    'INSERT INTO segmenteffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts],
    (error, results) => {
      if (error) throw error;

      response.status(201).send(`SegmentEffort added with ID: ${id}`);
    },
  );
};

module.exports = { getSegmentEffort, createSegmentEffort, getSegmentEffortsByUser, getSegmentEffortsByActivity };

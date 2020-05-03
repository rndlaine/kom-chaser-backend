const { pool } = require('./pool');

const getActivitiesByUser = (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM activity WHERE userid = $1', [userId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getActivity = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM activity WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

const createActivity = (request, response) => {
  const {
    id,
    user_id,
    name,
    distance,
    moving_time,
    elapsed_time,
    total_elevation_gain,
    elev_high,
    elev_low,
    type,
    start_date,
    average_speed,
    gear_id,
    average_watts,
    description,
  } = request.body;

  pool.query(
    'INSERT INTO activity (id, userId, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
    [id, user_id, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description],
    (error) => {
      if (error) throw error;
      response.status(201).send(request.body);
    },
  );
};

module.exports = { getActivitiesByUser, getActivity, createActivity };

const { pool } = require('./pool');

const getSegment = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segment WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

const createSegment = (request, response) => {
  const { id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain } = request.body;

  pool.query(
    'INSERT INTO segment (id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain],
    (error, results) => {
      if (error) throw error;

      response.status(201).send(`Segment added with ID: ${id}`);
    },
  );
};

module.exports = { getSegment, createSegment };

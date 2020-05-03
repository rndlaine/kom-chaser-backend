const { pool } = require('./pool');

const getAthlete = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM athlete WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createAthlete = (request, response) => {
  const { id } = request.body;

  pool.query('INSERT INTO athlete (id) VALUES ($1)', [id], (error, results) => {
    if (error) throw error;

    response.status(201).send(`Athlete added with ID: ${id}`);
  });
};

module.exports = { getAthlete, createAthlete };

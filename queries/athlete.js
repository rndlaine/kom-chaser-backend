const { pool } = require('./pool');
const { checkIsAuthValid } = require('./validate');

const getAthlete = async (request, response) => {
  const id = parseInt(request.params.id);
  if (!(await checkIsAuthValid(request.headers, id))) throw 'Not Authenticated...';

  pool.query('SELECT * FROM athlete WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

const createAthlete = async (request, response) => {
  const { id } = request.body;
  if (!(await checkIsAuthValid(request.headers, id))) throw 'Not Authenticated...';

  pool.query('INSERT INTO athlete (id) VALUES ($1)', [id], (error, results) => {
    if (error) throw error;

    response.status(201).send(`Athlete added with ID: ${id}`);
  });
};

module.exports = { getAthlete, createAthlete };

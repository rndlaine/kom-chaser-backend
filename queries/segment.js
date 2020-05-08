const { pool } = require('./pool');

const getSegment = async (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segment WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

module.exports = { getSegment };

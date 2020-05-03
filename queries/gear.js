const { pool } = require('./pool');

const getEquipment = async (request, response) => {
  const id = request.params.id;

  pool.query('SELECT * FROM gear WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

module.exports = { getEquipment };

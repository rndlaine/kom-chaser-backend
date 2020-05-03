const { pool } = require('./pool');

const getEquipment = (request, response) => {
  const id = request.params.id;

  pool.query('SELECT * FROM gear WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createEquipment = (request, response) => {
  const { id, name, description, primary } = request.body;

  pool.query('INSERT INTO gear (id, name, description, primary) VALUES ($1,$2,$3,$4)', [id, name, description, primary], (error) => {
    if (error) throw error;
    response.status(201).send(request.body);
  });
};

module.exports = { getEquipment, createEquipment };

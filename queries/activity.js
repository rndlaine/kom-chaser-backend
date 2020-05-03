const { checkIsAuthenticated, checkIsAuthValid } = require('./validate');
const { pool } = require('./pool');

const getActivitiesByUser = async (request, response) => {
  const userId = parseInt(request.params.id);
  if (!(await checkIsAuthValid(request.headers, userId))) throw 'Not Authenticated...';

  pool.query('SELECT * FROM activity WHERE userid = $1', [userId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getActivity = async (request, response) => {
  const id = parseInt(request.params.id);
  if (!(await checkIsAuthenticated(request.headers))) throw 'Not Authenticated...';

  pool.query('SELECT * FROM activity WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

module.exports = { getActivitiesByUser, getActivity };

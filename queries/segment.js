const { checkIsAuthenticated } = require('./validate');
const { pool } = require('./pool');

const getSegment = async (request, response) => {
  const id = parseInt(request.params.id);
  if (!(await checkIsAuthenticated(request.headers))) throw 'Not Authenticated...';

  pool.query('SELECT * FROM segment WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows[0]);
  });
};

const getSegmentLeaderboard = async (request, response) => {
  const id = parseInt(request.params.id);
  if (!(await checkIsAuthenticated(request.headers))) throw 'Not Authenticated...';

  pool.query('SELECT * FROM leaderboard WHERE segmentid = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

module.exports = { getSegment, getSegmentLeaderboard };

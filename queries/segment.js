var mPolyline = require('@mapbox/polyline');
const { pool } = require('./pool');
var { getDirection } = require('../helpers/coordinateHelpers');

const getSegment = async (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segment WHERE id = $1', [id], (error, results) => {
    if (error) throw error;
    const segment = results.rows[0];

    const polyline = mPolyline.decode(segment.polyline);
    const firstCoords = polyline[0];
    const lastCoords = polyline[polyline.length - 1];

    const direction = getDirection(firstCoords[0], firstCoords[1], lastCoords[0], lastCoords[1]);
    const updatedSegment = { ...segment, polyline, direction, lat: firstCoords[0], lon: firstCoords[1] };

    response.status(200).json(updatedSegment);
  });
};

module.exports = { getSegment };

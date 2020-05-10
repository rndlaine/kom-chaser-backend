function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

const getDirection = (lat1, lng1, lat2, lng2) => {
  const dTeta = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
  const dLon = Math.abs(lng1 - lng2);
  const teta = Math.atan2(dLon, dTeta);
  const direction = Math.round(toDegrees(teta));

  return direction;
};

module.exports = { getDirection };

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

const getDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }

    dist = Math.acos(dist);
    dist = ((dist * 180) / Math.PI) * 60 * 1.1515 * 1.609344;

    return dist;
  }
};

module.exports = { getDistance, getDirection };

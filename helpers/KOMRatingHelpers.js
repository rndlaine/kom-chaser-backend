const moment = require('moment');

const getFormattedDate = (seconds) => moment.utc(seconds * 1000).format('HH:mm:ss');

const getKOMRating = (effort, segment) => {
  const komSeconds = segment.kom_elapsed_time ? segment.kom_elapsed_time : 0;

  const effortTime = getFormattedDate(effort.elapsed_time);
  const komTime = getFormattedDate(komSeconds);
  const timeToKom = effort.elapsed_time > komSeconds ? getFormattedDate(effort.elapsed_time - komSeconds) : 0;
  const komScore = komSeconds / effort.elapsed_time;

  return { timeToKom, komTime, effortTime, komScore };
};

module.exports = { getFormattedDate, getKOMRating };

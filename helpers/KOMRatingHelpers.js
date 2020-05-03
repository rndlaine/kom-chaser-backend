const moment = require('moment');

const getFormattedDate = (seconds) => moment.utc(seconds * 1000).format('HH:mm:ss');

const getKOMRating = (effort, leaderboard) => {
  const komSeconds = leaderboard ? leaderboard.elapsed_time : 0;

  const effortTime = getFormattedDate(effort.elapsed_time);
  const komTime = getFormattedDate(komSeconds);
  const timeToKom = getFormattedDate(effort.elapsed_time - komSeconds);
  const komScore = komSeconds / effort.elapsed_time;

  let komRating = 'D';
  let komRatingColor = 'red';
  if (komScore > 0.6 && komScore < 0.7) {
    komRating = 'C';
    komRatingColor = 'orange';
  } else if (komScore > 0.7 && komScore < 0.85) {
    komRating = 'B';
    komRatingColor = 'yellow';
  } else if (komScore > 0.85 && komScore < 1) {
    komRating = 'A';
    komRatingColor = 'green';
  }

  if (komSeconds === 0) {
    komRating = 'NA';
  }

  return { timeToKom, komTime, effortTime, komScore, komRatingColor, komRating };
};

module.exports = { getFormattedDate, getKOMRating };

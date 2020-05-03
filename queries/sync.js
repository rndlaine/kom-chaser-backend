const lodash = require('lodash');
const { pool } = require('./pool');
const strava = require('../agents/strava');
const { handleSyncError } = require('./error');
const { leaderboardProperties, gearProperties, activityProperties, effortProperties, segmentProperties } = require('../fixtures/properties');

const syncActivity = async (request, response) => {
  const userId = parseInt(request.params.id);

  if (!request.body.accessToken) throw 'No access token was supplied';
  const activities = await strava.getActivities(request.body.accessToken);

  const activitiesWithGear = activities.filter((activity) => !!activity.gear_id);
  const uniqueByGearIds = lodash.uniqBy(activitiesWithGear, (activity) => activity.gear_id);

  uniqueByGearIds.forEach((activity) => {
    strava.getEquipment(request.body.accessToken, activity.gear_id).then((gear) => {
      // prettier-ignore
      pool.query('INSERT INTO gear (id, name, description, primary_gear) VALUES ($1,$2,$3,$4)', gearProperties.map((key) => gear[key]), handleSyncError);
    });
  });

  activities.forEach((activity) => {
    const updatedActivity = { ...activity, user_id: userId };

    // prettier-ignore
    pool.query('INSERT INTO activity (id, userId, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)', activityProperties.map((key) => updatedActivity[key]), handleSyncError);
  });

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

const syncSegmentEfforts = async (request, response) => {
  if (!request.body.accessToken) throw 'No access token was supplied';

  const userId = parseInt(request.params.id);
  const activities = await strava.getActivities(request.body.accessToken);

  const stravaPromises = activities.map((activitySummary) => strava.getActivity(request.body.accessToken, activitySummary.id));
  const stravaActivities = await Promise.all(stravaPromises);

  const segmentPromises = stravaActivities.map((activity) => {
    activity.segment_efforts.map((effort) => {
      // prettier-ignore
      pool.query('INSERT INTO segment (id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', segmentProperties.map((key) => effort.segment[key]), handleSyncError)
    });
  });

  await Promise.all(segmentPromises);

  const segmentEffortPromises = stravaActivities.map((activity) => {
    activity.segment_efforts.map((effort) => {
      const updatedEffort = { ...effort, id: `${effort.id}-${effort.start_date}`, userId, segmentId: effort.segment.id, activityId: activity.id };

      // prettier-ignore
      pool.query('INSERT INTO segmentEffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', effortProperties.map((key) => updatedEffort[key]), handleSyncError);
    });
  });

  await Promise.all(segmentEffortPromises);

  response.status(201).send(`Efforts Synced for userID: ${userId}`);
};

const syncLeaderboard = async (request, response) => {
  const userId = parseInt(request.params.id);

  if (!request.body.accessToken) throw 'No access token was supplied';

  pool.query('SELECT * from segmenteffort where userId = ($1)', [userId]).then((results) => {
    const efforts = results.rows;
    const uniqSegments = lodash.uniqBy(efforts, (effort) => effort.segmentid);

    uniqSegments.forEach((segment) => {
      pool.query('SELECT * from leaderboard where segmentid = ($1)', [segment.segmentid]).then((results) => {
        if (lodash.isEmpty(results.rows)) {
          strava.getLeaderboard(request.body.accessToken, segment.segmentid).then((leaderboard) => {
            leaderboard.entries.map((entry) => {
              const updatedEntry = { ...entry, segmentId: segment.segmentid };
              // prettier-ignore
              pool.query('INSERT INTO leaderboard (segmentId, athlete_name, elapsed_time, moving_time, start_date, rank) VALUES ($1,$2,$3,$4,$5,$6)', leaderboardProperties.map((key) => updatedEntry[key]), handleSyncError);
            });
          });
        }
      });
    });
  });

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

module.exports = { syncLeaderboard, syncActivity, syncSegmentEfforts };

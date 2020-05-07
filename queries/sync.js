const lodash = require('lodash');
const { pool } = require('./pool');
const strava = require('../agents/strava');
const { handleSyncError } = require('./error');
const { leaderboardProperties, gearProperties, activityProperties, effortProperties, segmentProperties } = require('../fixtures/properties');

const syncActivity = async (request, response) => {
  const userId = parseInt(request.params.id);
  if (!request.body.accessToken) throw 'No access token was supplied';

  await pool.query('INSERT INTO athlete (id) VALUES ($1)', [userId], handleSyncError);

  const activities = await strava.getActivities(request.body.accessToken);

  const activitiesWithGear = activities.filter((activity) => !!activity.gear_id);
  const uniqueByGearIds = lodash.uniqBy(activitiesWithGear, (activity) => activity.gear_id);

  let i = 0;
  for (i = 0; i < uniqueByGearIds.length; i++) {
    const activity = uniqueByGearIds[i];
    const results = pool.query('SELECT * from gear where id = ($1)', [activity.gear_id]);

    if (lodash.isEmpty(results.rows)) {
      const gear = await strava.getEquipment(request.body.accessToken, activity.gear_id);
      // prettier-ignore
      await pool.query('INSERT INTO gear (id, name, description, primary_gear) VALUES ($1,$2,$3,$4)', gearProperties.map((key) => gear[key]), handleSyncError);
    }
  }

  i = 0;
  for (i = 0; i < activities.length; i++) {
    const activity = activities[i];
    const updatedActivity = { ...activity, user_id: userId };

    // prettier-ignore
    await pool.query('INSERT INTO activity (id, userId, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)', activityProperties.map((key) => updatedActivity[key]), handleSyncError);
  }

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

const syncSegmentEfforts = async (request, response) => {
  if (!request.body.accessToken) throw 'No access token was supplied';

  const userId = parseInt(request.params.id);
  const stravaActivities = await strava.getActivities(request.body.accessToken);

  let stravaActivitiesPromises = [];
  let i = 0;
  for (i = 0; i < stravaActivities.length; i++) {
    const results = await pool.query('SELECT * from segmentEffort where activityId = ($1)', [stravaActivities[i].id]);

    if (lodash.isEmpty(results.rows)) {
      stravaActivitiesPromises.push(strava.getActivity(request.body.accessToken, stravaActivities[i].id));
    }
  }

  const activities = await Promise.all(stravaActivitiesPromises);

  const segmentPromises = activities.map((activity) => {
    activity.segment_efforts.map((effort) => {
      // prettier-ignore
      pool.query('INSERT INTO segment (id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', segmentProperties.map((key) => effort.segment[key]), handleSyncError)
    });
  });

  await Promise.all(segmentPromises);

  const segmentEffortPromises = activities.map((activity) => {
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

  const results = await pool.query('SELECT * from segmenteffort where userId = ($1)', [userId]);
  const efforts = results.rows;
  const uniqSegments = lodash.uniqBy(efforts, (effort) => effort.segmentid);

  let i;
  for (i = 0; i < uniqSegments.length; i++) {
    const segment = uniqSegments[i];
    const leaderboardResult = await pool.query('SELECT * from leaderboard where segmentid = ($1)', [segment.segmentid]);

    if (lodash.isEmpty(leaderboardResult.rows)) {
      const leaderboard = await strava.getLeaderboard(request.body.accessToken, segment.segmentid);
      const updatedEntry = { ...leaderboard.entries[0], segmentId: segment.segmentid };
      // prettier-ignore
      pool.query('INSERT INTO leaderboard (segmentId, athlete_name, elapsed_time, moving_time, start_date, rank) VALUES ($1,$2,$3,$4,$5,$6)', leaderboardProperties.map((key) => updatedEntry[key]), handleSyncError);
    }
  }

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

module.exports = { syncLeaderboard, syncActivity, syncSegmentEfforts };

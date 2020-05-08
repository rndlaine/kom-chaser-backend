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

  let i = 0;
  for (i = 0; i < stravaActivities.length; i++) {
    const results = await pool.query('SELECT * from segmentEffort where activityId = ($1)', [stravaActivities[i].id]);

    if (lodash.isEmpty(results.rows)) {
      const activity = await strava.getActivity(request.body.accessToken, stravaActivities[i].id);

      let j = 0;
      for (j = 0; j < activity.segment_efforts.length; j++) {
        const effort = activity.segment_efforts[j];
        const updatedEffort = { ...effort, id: `${effort.id}-${effort.start_date}`, userId, segmentId: effort.segment.id, activityId: activity.id };

        try {
          // prettier-ignore
          await pool.query('INSERT INTO segment (id, name, activity_type, distance, city, state, country, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', segmentProperties.map((key) => effort.segment[key]))
        } catch (err) {
          if (error && !error.message.includes('duplicate key value violates')) throw error;
        }

        // prettier-ignore
        await pool.query('INSERT INTO segmentEffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', effortProperties.map((key) => updatedEffort[key]), handleSyncError);
      }
    }
  }

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
    const segmentResult = await pool.query('SELECT * from segment where id = ($1)', [segment.segmentid]);

    if (!lodash.isEmpty(segmentResult.rows) && !segmentResult.rows[0].kom_elapsed_time) {
      const leaderboard = await strava.getLeaderboard(request.body.accessToken, segment.segmentid);
      console.log('getLeaderboard: ', segment.segmentid);
      const updatedEntry = { ...leaderboard.entries.find((x) => x.rank === 1), segmentId: segment.segmentid };
      // prettier-ignore
      pool.query('UPDATE segment SET kom_athlete_name = $2, kom_elapsed_time = $3, kom_moving_time = $4, kom_start_date = $5, kom_rank = $6 WHERE id = $1', leaderboardProperties.map((key) => updatedEntry[key]), handleSyncError);
    }
  }

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

module.exports = { syncLeaderboard, syncActivity, syncSegmentEfforts };

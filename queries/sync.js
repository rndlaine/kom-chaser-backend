const lodash = require('lodash');
const { pool } = require('./pool');
const strava = require('../agents/strava');
const { handleSyncError } = require('./error');
const { leaderboardProperties, gearProperties, activityProperties, effortProperties, segmentProperties } = require('../fixtures/properties');

const syncActivity = async (request, response) => {
  const userId = parseInt(request.params.id);
  if (!request.body.accessToken) throw 'No access token was supplied';
  await pool.query('Update athlete SET isSyncing = true, lastSyncDate = to_timestamp($1) where id = ($2)', [Date.now() / 1000, userId]);

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

  await pool.query('Update athlete SET isSyncing = false where id = ($1)', [userId]);
};

const syncSegmentEfforts = async (request, response) => {
  const userId = parseInt(request.params.id);
  if (!request.body.accessToken) throw 'No access token was supplied';

  await pool.query('Update athlete SET isSyncing = true, lastSyncDate = to_timestamp($1) where id = ($2)', [Date.now() / 1000, userId]);
  const stravaActivities = await strava.getActivities(request.body.accessToken);

  let i = 0;
  for (i = 0; i < stravaActivities.length; i++) {
    const results = await pool.query('SELECT * from segmentEffort where activityId = ($1)', [stravaActivities[i].id]);

    if (lodash.isEmpty(results.rows)) {
      const activity = await strava.getActivity(request.body.accessToken, stravaActivities[i].id);

      let j = 0;
      for (j = 0; j < activity.segment_efforts.length; j++) {
        const effort = activity.segment_efforts[j];
        const bdSegment = await pool.query('SELECT * from segment where id = ($1)', [effort.segment.id]);

        if (bdSegment.rows.length === 0) {
          const segment = await strava.getSegment(request.body.accessToken, effort.segment.id);

          try {
            // prettier-ignore
            await pool.query('INSERT INTO segment (id, name, activity_type, distance, city, state, country, total_elevation_gain, polyline) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [...segmentProperties.map((key) => effort.segment[key]), lodash.get(segment, "map.polyline")])
          } catch (error) {
            if (error && !error.message.includes('duplicate key value violates')) throw error;
          }
        }

        const updatedEffort = { ...effort, id: `${effort.id}-${effort.start_date}`, userId, segmentId: effort.segment.id, activityId: activity.id };

        // prettier-ignore
        await pool.query('INSERT INTO segmentEffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', effortProperties.map((key) => updatedEffort[key]), handleSyncError);
      }
    }
  }

  await pool.query('Update athlete SET isSyncing = false where id = ($1)', [userId]);
};

const syncLeaderboard = async (request, response) => {
  const userId = parseInt(request.params.id);

  if (!request.body.accessToken) throw 'No access token was supplied';
  await pool.query('Update athlete SET isSyncing = true, lastSyncDate = to_timestamp($1) where id = ($2)', [Date.now() / 1000, userId]);

  const results = await pool.query('SELECT * from segmenteffort where userId = ($1)', [userId]);
  const efforts = results.rows;
  const uniqSegments = lodash.uniqBy(efforts, (effort) => effort.segmentid);

  let i;
  for (i = 0; i < uniqSegments.length; i++) {
    const segment = uniqSegments[i];
    const segmentResult = await pool.query('SELECT * from segment where id = ($1)', [segment.segmentid]);

    if (!lodash.isEmpty(segmentResult.rows) && !segmentResult.rows[0].kom_elapsed_time) {
      const leaderboard = await strava.getLeaderboard(request.body.accessToken, segment.segmentid);
      const updatedEntry = { ...leaderboard.entries.find((x) => x.rank === 1), segmentId: segment.segmentid };

      // prettier-ignore
      pool.query('UPDATE segment SET kom_athlete_name = $2, kom_elapsed_time = $3, kom_moving_time = $4, kom_start_date = $5, kom_rank = $6 WHERE id = $1', leaderboardProperties.map((key) => updatedEntry[key]), handleSyncError);
    }
  }

  await pool.query('Update athlete SET isSyncing = false where id = ($1)', [userId]);
};

const syncAll = async (request, response) => {
  await syncActivity(request, response);
  await syncSegmentEfforts(request, response);
  await syncLeaderboard(request, response);

  response.status(201).send(` Synced complete`);
};

module.exports = { syncAll, syncLeaderboard, syncActivity, syncSegmentEfforts };

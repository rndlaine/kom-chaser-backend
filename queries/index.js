const athlete = require('./athlete');
const activity = require('./activity');
const effort = require('./effort');
const segment = require('./segment');
const sync = require('./sync');

module.exports = {
  getAthlete: athlete.getAthlete,
  createAthlete: athlete.createAthlete,
  getActivitiesByUser: activity.getActivitiesByUser,
  getActivity: activity.getActivity,
  createActivity: activity.createActivity,
  getSegment: segment.getSegment,
  createSegment: segment.createSegment,
  getSegmentEffort: effort.getSegmentEffort,
  createSegmentEffort: effort.createSegmentEffort,
  getSegmentEffortsByUser: effort.getSegmentEffortsByUser,
  getSegmentEffortsByActivity: effort.getSegmentEffortsByActivity,
  syncActivity: sync.syncActivity,
  syncSegmentEfforts: sync.syncSegmentEfforts,
};

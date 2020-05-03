const athlete = require('./athlete');
const activity = require('./activity');
const effort = require('./effort');
const segment = require('./segment');
const sync = require('./sync');
const gear = require('./gear');

module.exports = {
  ...athlete,
  ...activity,
  ...effort,
  ...sync,
  ...gear,
  ...segment,
};

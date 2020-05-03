// prettier-ignore
const gearProperties = ['id', 'name', 'description', 'primary'];
// prettier-ignore
const activityProperties = ['id','user_id','name','distance','moving_time','elapsed_time','total_elevation_gain','elev_high','elev_low','type','start_date','average_speed','gear_id','average_watts','description'];
// prettier-ignore
const effortProperties = ['id', 'userId', 'segmentId', 'activityId', 'elapsed_time', 'start_date', 'distance', 'is_kom', 'name', 'moving_time', 'average_watts'];
// prettier-ignore
const segmentProperties = ['id', 'name', 'activity_type', 'distance', 'city', 'state', 'country', 'created_at', 'total_elevation_gain'];
// prettier-ignore
const leaderboardProperties = ["segmentId", "athlete_name", "elapsed_time", "moving_time", "start_date", "rank"];

module.exports = { leaderboardProperties, gearProperties, effortProperties, segmentProperties, activityProperties };

// prettier-ignore
const activityProperties = ['id','user_id','name','distance','moving_time','elapsed_time','total_elevation_gain','elev_high','elev_low','type','start_date','average_speed','gear_id','average_watts','description'];
// prettier-ignore
const effortProperties = ['id', 'userId', 'segmentId', 'activityId', 'elapsed_time', 'start_date', 'distance', 'is_kom', 'name', 'moving_time', 'average_watts'];
// prettier-ignore
const segmentProperties = ['id', 'name', 'activity_type', 'distance', 'city', 'state', 'country', 'created_at', 'total_elevation_gain'];

module.exports = { effortProperties, segmentProperties, activityProperties };

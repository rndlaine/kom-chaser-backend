const axios = require('axios');
const Pool = require('pg').Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !process.env.DATABASE_URL.includes('localhost'),
});

const getAthlete = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM athlete WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createAthlete = (request, response) => {
  const { id } = request.body;

  pool.query('INSERT INTO athlete (id) VALUES ($1)', [id], (error, results) => {
    if (error) throw error;

    response.status(201).send(`Athlete added with ID: ${id}`);
  });
};

const getActivitiesByUser = (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM activity WHERE userid = $1', [userId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getActivity = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM activity WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createActivity = (request, response) => {
  const {
    id,
    user_id,
    name,
    distance,
    moving_time,
    elapsed_time,
    total_elevation_gain,
    elev_high,
    elev_low,
    type,
    start_date,
    average_speed,
    gear_id,
    average_watts,
    description,
  } = request.body;

  pool.query(
    'INSERT INTO activity (id, userId, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
    [
      id,
      user_id,
      name,
      distance,
      moving_time,
      elapsed_time,
      total_elevation_gain,
      elev_high,
      elev_low,
      type,
      start_date,
      average_speed,
      gear_id,
      average_watts,
      description,
    ],
    (error) => {
      if (error) throw error;
      response.status(201).send(request.body);
    },
  );
};

const getSegment = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segment WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createSegment = (request, response) => {
  const { id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain } = request.body;

  pool.query(
    'INSERT INTO segment (id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain],
    (error, results) => {
      if (error) throw error;

      response.status(201).send(`Segment added with ID: ${id}`);
    },
  );
};

const getSegmentEffortsByActivity = (request, response) => {
  const activityId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE activityid = $1', [activityId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getSegmentEffortsByUser = (request, response) => {
  const userId = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE userid = $1', [userId], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const getSegmentEffort = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM segmenteffort WHERE id = $1', [id], (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
};

const createSegmentEffort = (request, response) => {
  const {
    id,
    userId,
    segmentId,
    activityId,
    elapsed_time,
    start_date,
    distance,
    is_kom,
    name,
    moving_time,
    average_watts,
  } = request.body;

  pool.query(
    'INSERT INTO segmenteffort (id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [id, userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts],
    (error, results) => {
      if (error) throw error;

      response.status(201).send(`SegmentEffort added with ID: ${id}`);
    },
  );
};

const syncActivity = async (request, response) => {
  const userId = parseInt(request.params.id);
  const { accessToken } = request.body;

  if (!accessToken) throw 'No access token was supplied';

  const limit = 200;
  const result = await axios.get(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    crossDomain: true,
  });

  if (!result.data) throw 'Unable to connect to strava';

  const properties = [
    'id',
    'user_id',
    'name',
    'distance',
    'moving_time',
    'elapsed_time',
    'total_elevation_gain',
    'elev_high',
    'elev_low',
    'type',
    'start_date',
    'average_speed',
    'gear_id',
    'average_watts',
    'description',
  ];

  result.data.forEach((item) => {
    pool.query(
      'INSERT INTO activity (id, userId, name, distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low, type, start_date, average_speed, gear_id, average_watts, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
      properties.map((key) => {
        const updatedObject = { ...item, user_id: userId };
        return updatedObject[key];
      }),
      (error) => {
        if (error && !error.message.includes('duplicate key value violates')) throw error;
      },
    );
  });

  response.status(201).send(`Activities Synced for userID: ${userId}`);
};

const syncSegmentEfforts = async (request, response) => {
  const userId = parseInt(request.params.id);
  const { accessToken } = request.body;

  if (!accessToken) throw 'No access token was supplied';

  const activityResult = await axios.get(`https://www.strava.com/api/v3/activities/3363350698`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    crossDomain: true,
  });

  const effortProperties = [
    'userId',
    'segmentId',
    'activityId',
    'elapsed_time',
    'start_date',
    'distance',
    'is_kom',
    'name',
    'moving_time',
    'average_watts',
  ];

  const segmentProperties = [
    'id',
    'name',
    'activity_type',
    'distance',
    'city',
    'state',
    'country',
    'created_at',
    'total_elevation_gain',
  ];

  let index = 0;
  activityResult.data.segment_efforts.forEach((effort) => {
    pool.query(
      'INSERT INTO segmentEffort (userId, segmentId, activityId, elapsed_time, start_date, distance, is_kom, name, moving_time, average_watts) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      effortProperties.map((key) => {
        const updatedItem = {
          ...effort,
          userId,
          segmentId: effort.segment.id,
          activityId: '3363350698',
        };
        return updatedItem[key];
      }),
      (error) => {
        if (error && !error.message.includes('duplicate key value violates')) throw error;
      },
    );

    pool.query(
      'INSERT INTO segment (id, name, activity_type, distance, city, state, country, created_at, total_elevation_gain) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      segmentProperties.map((key) => effort.segment[key]),
      (error) => {
        if (error && !error.message.includes('duplicate key value violates')) throw error;
      },
    );

    index++;
  });

  response.status(201).send(`Efforts Synced for userID: ${userId}`);
};

module.exports = {
  getAthlete,
  createAthlete,
  createActivity,
  getActivitiesByUser,
  getActivity,
  getSegment,
  createSegment,
  createSegmentEffort,
  getSegmentEffortsByActivity,
  getSegmentEffortsByUser,
  getSegmentEffort,
  syncActivity,
  syncSegmentEfforts,
};

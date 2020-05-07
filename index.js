require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/athlete/:id', db.getAthlete);
app.post('/athlete', db.createAthlete);
app.get('/athlete/:id/activity', db.getActivitiesByUser);
app.get('/activity/:id', db.getActivity);
app.get('/segment/:id', db.getSegment);
app.get('/gear/:id', db.getEquipment);
app.get('/activity/:id/segmentefforts', db.getSegmentEffortsByActivity);
app.get('/athlete/:id/segmentefforts', db.getSegmentEffortsByUser);
app.get('/athlete/:id/bestsegmentefforts', db.getBestSegmentEffortsByUser);
app.get('/segment/:id/segmentefforts', db.getSegmentEffortsBySegment);
app.get('/segmentefforts/:id', db.getSegmentEffort);
app.get('/segment/:id/leaderboard', db.getSegmentLeaderboard);
app.post('/athlete/:id/sync-activity', db.syncActivity);
app.post('/athlete/:id/sync-efforts', db.syncSegmentEfforts);
app.post('/athlete/:id/sync-leaderboard', db.syncLeaderboard);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

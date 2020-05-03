require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cors());

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/athlete/:id', db.getAthlete);
app.post('/athlete', db.createAthlete);

app.get('/athlete/:id/activity', db.getActivitiesByUser);
app.get('/activity/:id', db.getActivity);
app.post('/activity', db.createActivity);

app.get('/segment/:id', db.getSegment);
app.post('/segment', db.createSegment);

app.get('/activity/:id/segmentefforts', db.getSegmentEffortsByActivity);
app.get('/athlete/:id/segmentefforts', db.getSegmentEffortsByUser);
app.get('/segmentefforts/:id', db.getSegmentEffort);
app.post('/segmentefforts', db.createSegmentEffort);

app.post('/athlete/:id/sync-activity', db.syncActivity);
app.post('/athlete/:id/sync-efforts', db.syncSegmentEfforts);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

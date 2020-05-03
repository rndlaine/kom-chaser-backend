CREATE TABLE athlete (
    id bigint NOT NULL PRIMARY KEY
);

CREATE TABLE activity (
    id bigint NOT NULL PRIMARY KEY,
    userId bigint NOT NULL REFERENCES athlete(id),
    name text,
    distance float,
    moving_time bigint,
    elapsed_time bigint,
    total_elevation_gain float,
    elev_high float,
    elev_low float,
    type text,
    start_date date,
    average_speed float,
    gear_id text,
    average_watts float,
    description text
);

CREATE TABLE segment (
    id bigint NOT NULL PRIMARY KEY,
    name text,
    activity_type text,
    distance float,
    city text,
    state text,
    country text,
    created_at date,
    total_elevation_gain float
);

CREATE TABLE segmentEffort (
    id text NOT NULL PRIMARY KEY,
    userId bigint NOT NULL REFERENCES athlete(id),
    segmentId bigint NOT NULL REFERENCES segment(id),
    activityId bigint NOT NULL REFERENCES activity(id),
    elapsed_time bigint,
    start_date date,
    distance float,
    is_kom boolean,
    name text,
    moving_time bigint,
    average_watts float
);

CREATE TABLE gear (
    id varchar(20) NOT NULL PRIMARY KEY,
    name text,
    description text,
    primary_gear boolean
);

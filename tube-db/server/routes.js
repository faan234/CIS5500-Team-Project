// Routes are Complete; however
// TODO: Check all routes implimentation adhears to all cases described in instructions doc

const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');
//const { connect } = require('./server');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// ********************************************
//            SIMPLE ROUTE EXAMPLE
// ********************************************

// Route 1 (handler)
async function hello(req, res) {
    // a GET request to /hello?name=Steve
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the tubeDB server!`)
    } else {
        res.send(`Hello! Welcome to the tubeDB server!`)
    }
}

// ********************************************
//             CHANNEL-SPECIFIC ROUTES
// ********************************************

// CS Route 1 (handler)
async function channel(req, res) {

    if (req.query.ranking){
        connection.query(
            `
            SELECT *
            FROM TOP_YOUTUBE_CHANNELS
            Where channel_rank = "${req.query.ranking}" 
            `, function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });
    }
};

// CS Route 2 (handler) - get the top 100 channels by rank no filters
async function find_channels(req, res) {

    connection.query(
        `
        SELECT channel_rank AS Ranking, channel_title AS Title, country, channel_language AS language, subscribers, views
        FROM TOP_YOUTUBE_CHANNELS
        ORDER BY Ranking
        LIMIT 0, 100;
        `, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    
};

// ********************************************
//             VIDEO-SPECIFIC ROUTES
// ********************************************


async function home_videos(req, res) {

    country = req.query.country
    pageCount = req.query.page
    const limit = pageCount * 20

    finalQuery = `SELECT video_id, title, trending_date, likes, thumbnail_link   
    FROM TOP_TRENDING_VIDEOS WHERE country='${country}' LIMIT ${limit};
    `

    connection.query(finalQuery, function (error, results, fields) {

        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

module.exports = {
    hello,
    channel,
    find_channels,
    home_videos
}
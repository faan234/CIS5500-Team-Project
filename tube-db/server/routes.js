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

//  Selected Channel 5 most recent trending videos (with aggregation) (handler)
// this runs in DG in about 100 seconds without optimization.
async function selected_channel_recent_trending(req, res) {

    if (req.query.ranking){
        connection.query(
            `
            WITH Selected_Channel AS (
                SELECT channel_title
                FROM TOP_YOUTUBE_CHANNELS
                WHERE channel_rank = ${req.query.ranking}
            )SELECT V.title AS title, V.published_at AS published, V.video_id AS video_id,
                    MAX(V.view_count) AS views, MAX(V.trending_date) AS trend_stop,
                    MIN(V.trending_date) AS trend_start, GROUP_CONCAT(DISTINCT V.country) AS countries
            FROM TOP_TRENDING_VIDEOS AS V JOIN Selected_Channel AS C
            WHERE V.channel_title = C.channel_title
            GROUP BY title
            ORDER BY V.published_at DESC
            LIMIT 5;
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

    //switch depending on recieved params

    console.log("??????????????????????????????")
    console.log(req.query)
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

    let countryLangProdClause = ""

    if(req.query.country !== 'Select' && req.query.country !== 'undefined'){
        countryLangProdClause += ` AND country = '${req.query.country}'`
    }

    if(req.query.language !== 'Select' && req.query.language !== 'undefined'){
        countryLangProdClause += ` AND channel_language = '${req.query.language}'`
    }

    if(req.query.producer !== 'Select' && req.query.producer !== 'undefined'){
        countryLangProdClause += ` AND producer_type = '${req.query.producer}'`
    }

    //  SELECT ROW_NUMBER() OVER (ORDER BY subscribers DESC) Ranking this is a good idea, but breaks other items

    if (req.query.searchString === 'undefined'){
        console.log("Why?")
        connection.query(
            `
            SELECT channel_rank AS Ranking, 
                channel_title AS Title, country, channel_language AS language, subscribers, views
            FROM TOP_YOUTUBE_CHANNELS
            ORDER BY subscribers DESC
            LIMIT 0, 100;
            `, function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });
    
    } else if (req.query.searchString === "null"){
        console.log('!!!' + req.query.searchString);
        connection.query(
            `
            SELECT channel_rank AS Ranking, channel_title AS Title, country, channel_language AS language, subscribers, views
            FROM TOP_YOUTUBE_CHANNELS
            WHERE channel_rank >= ${req.query.rankingLow} AND channel_rank <= ${req.query.rankingHigh}
                AND subscribers >= ${req.query.subsLow} AND subscribers <= ${req.query.subsHigh} AND 
                library_size >= ${req.query.libSizeLow} AND library_size <= ${req.query.libSizeHigh} AND
                views_per_video >= ${req.query.viewsPerLow} AND views_per_video <= ${req.query.viewsPerHigh} AND
                view_growth_rate_l3m >= ${req.query.viewsGrowthLow} AND view_growth_rate_l3m <= ${req.query.viewsGrowthHigh} AND
                subscriber_growth_rate_l3m >= ${req.query.subsGrowthLow} AND subscriber_growth_rate_l3m<= ${req.query.subsGrowthHigh} ${countryLangProdClause}
            ORDER BY subscribers DESC
            LIMIT 0, 100;
            `, function (error, results, fields) {
                if (error) {
                    console.log(error)
                    res.json({ error: error })
                } else if (results) {
                    res.json({ results: results })
                }
            });
    
    } else {     
        connection.query(
            `
            SELECT channel_rank AS Ranking, channel_title AS Title, country, channel_language AS language, subscribers, views
            FROM TOP_YOUTUBE_CHANNELS
            WHERE channel_title LIKE '%${req.query.searchString}%' AND channel_rank >= ${req.query.rankingLow} AND 
                channel_rank <= ${req.query.rankingHigh} AND views >= ${req.query.viewsLow} AND views <= ${req.query.viewsHigh} AND
                subscribers >= ${req.query.subsLow} AND subscribers <= ${req.query.subsHigh} AND 
                library_size >= ${req.query.libSizeLow} AND library_size <= ${req.query.libSizeHigh} AND
                views_per_video >= ${req.query.viewsPerLow} AND views_per_video <= ${req.query.viewsPerHigh} AND
                view_growth_rate_l3m >= ${req.query.viewsGrowthLow} AND view_growth_rate_l3m <= ${req.query.viewsGrowthHigh} AND
                subscriber_growth_rate_l3m >= ${req.query.subsGrowthLow} AND subscriber_growth_rate_l3m<= ${req.query.subsGrowthHigh} ${countryLangProdClause}
            ORDER BY subscribers DESC
            LIMIT 0, 100;
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

// ********************************************
//             VIDEO-SPECIFIC ROUTES
// ********************************************


async function trending_videos(req, res) {

    country = req.query.country
    pageCount = req.query.page
    const limit = pageCount * 20

    finalQuery = `
    WITH Videos AS (
        SELECT video_id, MAX(trending_date) as trend_stop, thumbnail_link
        FROM TOP_TRENDING_VIDEOS
        WHERE country = '${country}'
        GROUP BY video_id
        LIMIT 100
    )
    SELECT video_id, trend_stop, thumbnail_link
        FROM Videos
        ORDER BY trend_stop DESC
        LIMIT ${limit};
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

async function singleVideo(req, res){
    videoid = req.query.videoid

    finalQuery = `
    SELECT title, published_at AS published, video_id,
            MAX(view_count) AS views, MAX(trending_date) AS trend_stop,
            MIN(trending_date) AS trend_start, thumbnail_link, likes,
            GROUP_CONCAT(DISTINCT country) AS countries
    FROM TOP_TRENDING_VIDEOS
    WHERE video_id = '${videoid}'
    GROUP BY title
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
    trending_videos,
    selected_channel_recent_trending,
    singleVideo,
}
'use strict';

const AWS = require("aws-sdk");
const Axios = require('axios');

const client = new AWS.DynamoDB.DocumentClient();


const getValue = k => {
    return new Promise((resolve, reject) => {
        const table = 'PoliceVideosMemos';
        const params = {
            Key: {
                "id": k
            },
            TableName: table
        };
        client.get(params, (err, data) => {
            if (err) {
                console.error("Error getting most recent recrod from LastInsertedVideo table");
                reject(err);
            }
            else {
                if (data.Item) {
                    resolve(data.Item.value);
                } else {
                    resolve(data.Item);
                }
            }
        });
    });
}

const setKeyValue = (k, v) => {
    return new Promise((resolve, reject) => {
        const table = 'PoliceVideosMemos';
        const params = {
            Item: {
                "id": k,
                "value": v
            },
            TableName: table
        };
        client.put(params, function (err, data) {
            if (err) {
                console.log("Error putting item ", k, err, err.stack);
                reject(err);
            } else {
                resolve(data);
            }
        })
    });
}

var downloadVideo = async (id, url) => {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    return response.data;

};

var uploadToS3 = async (data, s3FileName) => {
    return await new Promise((resolve, reject) => {
        const client = new AWS.S3();
        const params = {
            ACL: 'public-read',
            Bucket: 'twitter-vids',
            Key: s3FileName, // File name you want to save as in S3
            Body: data
        };
        console.log("Putting obj in s3")
        client.putObject(params, (err, data) => {
            if (err) {
                console.log("ERROR IN S3", err);
                reject(err);
            } else {
                console.log("SUCCESS ", data);
                resolve(data);
            }
        });
    });
}

module.exports.getAsync = async id => {
    if (id === 'lastTweetRetrieved') {
        return await getValue(id);
    }
    return await getValue(id);

};

module.exports.setAsync = async (id, value) => {
    return await setKeyValue(id, value);
}

module.exports.addTweet = async tweet => {
    /*{
        TweetBody: string, // Contents of the tweet, if available
        TweetLink: string, // Link to original tweet, if available
        VideoLink: string,
        Location: string | {lat: number, lng: number} // City name or coordinates, if available
        Timestamp: string // dd-mm-yy timestamp (or some other format parseable by datetime), if available,
        TweetID: string,
    }*/

    const tweetObj = {
        TweetBody: null,
        TweetLink: null,
        VideoLink: null,
        Location: null,
        Timestamp: null,
        TweetID: null
    };
    tweetObj.TweetBody = tweet.TweetBody;
    tweetObj.TweetLink = tweet.TweetLink;
    tweetObj.VideoLink = tweet.VideoLink;
    tweetObj.Location = tweet.Location;
    tweetObj.Timestamp = tweet.Timestamp;
    tweetObj.TweetID = tweet.TweetID;
    await setKeyValue(`tweet-${tweetObj.TweetID}`, tweetObj);
    const datastream = await downloadVideo(tweetObj.TweetID, tweetObj.VideoLink);
    const ret = await uploadToS3(datastream, `${tweetObj.TweetID}.mp4`);
    return ret
    // await setKeyValue('lastInsertedVideo', tweetObj);
};
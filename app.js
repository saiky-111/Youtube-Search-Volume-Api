const express = require('express');
const axios = require('axios');

const app = express();
const apiKey = 'AIzaSyDiwn4myVx-kDHF6pjt8DdtNSv2lF-GW_8'; //API

//  HTML
app.get('/', (req, res) => {
    res.send(`
    <h1>YouTube Keyword Search Volume Estimation</h1>
    <form action="/search" method="get">
      <label for="keyword">Enter a keyword:</label>
      <input type="text" id="keyword" name="keyword" required>
      <button type="submit">Search</button>
    </form>
  `);
});


app.get('/search', async (req, res) => {
    const keyword = req.query.keyword;

    try {
        //YouTubeAPI
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/search?q=${keyword}&key=${apiKey}&part=snippet&type=video&maxResults=50`
        );


        const videos = response.data.items;
        let totalViews = 0;

        if (videos && videos.length > 0) {

            const videoIds = videos.map((video) => video.id.videoId).join(',');


            const videoResponse = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&key=${apiKey}&part=statistics`
            );

            const videoStats = videoResponse.data.items;
            if (videoStats && videoStats.length > 0) {
                videoStats.forEach((videoStat) => {
                    if (videoStat.statistics && videoStat.statistics.viewCount) {
                        totalViews += parseInt(videoStat.statistics.viewCount);
                    }
                });

                const searchVolumeEstimate = totalViews;


                res.send(`
            <h1>YouTube Keyword Search Volume Estimation</h1>
            <p>Keyword: ${keyword}</p>
            <p>Estimated Search Volume: ${searchVolumeEstimate}</p>
          `);
            } else {
                //for video
                res.send(`
            <h1>YouTube Keyword Search Volume Estimation</h1>
            <p>No video statistics found for the keyword: ${keyword}</p>
          `);
            }
        } else {
           //for keyword
            res.send(`
          <h1>YouTube Keyword Search Volume Estimation</h1>
          <p>No videos found for the keyword: ${keyword}</p>
        `);
        }
    } catch (error) {
        console.error(error);

        if (error.response) {
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Data:', error.response.data);
        }

        res.status(500).send('Error occurred while fetching data from YouTube API.');
    }
});
const port = process.env.PORT || 3010;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
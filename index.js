import express from "express";
import axios from "axios";
import * as fs from 'fs';
import fetch from 'node-fetch';


const app = express();
const port = 3000;
const pageCount = 1;
const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageCount}&sort_by=popularity.desc`;
const tvShowUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${pageCount}&sort_by=popularity.desc`;
const topRatedFilms = `https://api.themoviedb.org/3/movie/top_rated?language=en-US`;
const topRatedSeries = `https://api.themoviedb.org/3/tv/top_rated?language=en-US`;
const details = `https://api.themoviedb.org/3/tv/1?language=en-US`;


const configData = JSON.parse(fs.readFileSync('config.json', 'utf-8'))

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: configData.Authorization,
    }
}
app.use(express.static("public"));




app.get("/", async (req, res) => {
    try {
        const [movieResponse, tvShowResponse] = await Promise.all([
            axios.get(url, options),
            axios.get(tvShowUrl, options),
        ]);
        const movies = movieResponse.data.results;
        const tvShows = tvShowResponse.data.results;

        res.render('home.ejs', { movies, tvShows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
})


app.get("/topMovies", async (req, res) => {
    try {
        const pageCount = parseInt(req.query.page) || 1;

        // Make the API request with the updated pageCount
        const topMovie = await axios.get(topRatedFilms + `&page=${pageCount}`, options);
        const movies = topMovie.data.results;
        res.render("top-movies.ejs", { movies, pageCount });
    } catch (error) {
        console.log(error);
    }
})

app.get("/TvShows", async (req, res) => {
    try {
        const pageCount = parseInt(req.query.page) || 1;

        // Fetch the top-rated TV series
        const topSeriesResponse = await axios.get(`${topRatedSeries}&page=${pageCount}`, options);
        const tvShows = topSeriesResponse.data.results;

        // Fetch additional details for TV shows (e.g., number of seasons and episodes)
        const tvShowDetails = await Promise.all(
            tvShows.map(async (tvShow) => {
                const tvShowDetailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${tvShow.id}?language=en-US`, options);
                return {
                    ...tvShow,
                    numberOfSeasons: tvShowDetailsResponse.data.number_of_seasons,
                    numberOfEpisodes: tvShowDetailsResponse.data.number_of_episodes,
                };
            })
        );

        res.render("TvShows.ejs", { tvShows: tvShowDetails, pageCount });
    } catch (error) {
        console.log(error);
    }
});

app.get("/Upcoming", async (req, res) => {
    try {
        const pageCount = parseInt(req.query.page) || 1;
        const upcoming = await axios.get(`https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${pageCount}`, options);

        const Upcoming = upcoming.data.results;
        res.render("Upcoming.ejs", { Upcoming, pageCount });
    } catch (error) {
        console.log(error);
    }
})

app.get("/movies", async (req, res) => {
    try {
        const pageCount = parseInt(req.query.page) || 1;
        const popFilm = await axios.get(`https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${pageCount}`, options);
        const Film = popFilm.data.results;
        res.render("movies.ejs", { Film, pageCount });
    } catch (error) {
        console.log(error);

    }
})

app.get("/Series", async (req, res) => {
    try {
        const pageCount = parseInt(req.query.page) || 1;

        // Fetch the top-rated TV series
        const topSeriesResponse = await axios.get(`https://api.themoviedb.org/3/tv/popular?language=en-US&page=${pageCount}`, options);
        const tvShows = topSeriesResponse.data.results;

        // Fetch additional details for TV shows (e.g., number of seasons and episodes)
        const tvShowDetails = await Promise.all(
            tvShows.map(async (tvShow) => {
                const tvShowDetailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${tvShow.id}?language=en-US`, options);
                return {
                    ...tvShow,
                    numberOfSeasons: tvShowDetailsResponse.data.number_of_seasons,
                    numberOfEpisodes: tvShowDetailsResponse.data.number_of_episodes,
                };
            }))


        res.render("Series.ejs", { tvShows: tvShowDetails, pageCount });
    } catch (error) {
        console.log(error);

    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
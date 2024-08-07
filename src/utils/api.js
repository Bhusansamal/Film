import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = import.meta.env.VITE_APP_TMDB_TOKEN;

const headers = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    accept: "application/json"
};

export const fetchDataFromApi = async (url, params) => {
    try {
        const response = await axios.get(`${BASE_URL}${url}`, {
            headers,
            params,
        });
        return response.data;
    } catch (err) {
        console.error("API request failed:", err);
        throw err;
    }
};

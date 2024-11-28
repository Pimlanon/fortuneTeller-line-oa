const axios = require("axios");

const APIAxios = axios.create({
    timeout: 1000 * (10 * 60),
});

APIAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            return {
                ...error.response,
                status: error.response.status,
            };
        }

        return Promise.reject(error);
    },
);

module.exports = APIAxios;
/* eslint-disable */
require('dotenv').config();

module.exports = {
  env: {
    BUCKET_FOR_AVATARS: process.env.BUCKET_FOR_AVATARS,
    PORT_APP: process.env.PORT_APP,
    URL_API: process.env.URL_API,
    URL_APP: process.env.URL_APP,
  },
};
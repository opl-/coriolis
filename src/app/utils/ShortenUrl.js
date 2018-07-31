import request from 'superagent';

const agent = request.agent();

/**
 * Shorten a URL
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
export default function shorternUrl(url, success, error) {
  orbisShorten(url, success, error);
}

const SHORTEN_API_GOOGLE = 'https://www.googleapis.com/urlshortener/v1/url?key=';
/**
 * Shorten a URL using Google's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function shortenUrlGoogle(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_GOOGLE + window.CORIOLIS_GAPI_KEY)
        .send({ longUrl: url })
        .end(function(err, response) {
          if (err) {
            error(response.statusText == 'OK' ? 'Bad Request' : response.statusText);
          } else {
            success(response.body.id);
          }
        });
    } catch (e) {
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const SHORTEN_API_EDDP = 'https://eddp.co/u';
/**
 * Shorten a URL using EDDP's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function shortenUrlEddp(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_EDDP)
        .send(url)
        .end(function(err, response) {
          if (err) {
            error('Bad Request');
          } else {
            success(response.header['location']);
          }
        });
    } catch (e) {
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const SHORTEN_API_ORBIS = 'https://s.orbis.zone/a';
/**
 * Shorten a URL using Orbis's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function orbisShorten(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_ORBIS)
        .field('lsturl', url)
        .field('format', 'json')
        .end(function(err, response) {
          if (err) {
            error('Bad Request');
          } else {
            success(response.body.short);
          }
        });
    } catch (e) {
      console.log(e);
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const API_ORBIS = 'https://orbis.zone/api/builds/add';
const API_ORBIS_LOGIN = 'https://orbis.zone/api/login';

/**
 * Upload to Orbis
 * @param  {object} ship        The URL to shorten
 * @param {object} creds Orbis credentials
 * @return {Promise<any>} Either a URL or error message.
 */
export function orbisUpload(ship, creds) {
  return new Promise(async (resolve, reject) => {
    if (window.navigator.onLine) {
      try {
        agent
          .post(API_ORBIS_LOGIN)
          .send(creds)
          .redirects(0)
          .withCredentials()
          .end(function(err) {
            if (err) {
              reject('Bad Request');
            } else {
              agent
                .post(API_ORBIS)
                .withCredentials()
                .set('Content-Type', 'application/json')
                .send(ship)
                .end(function(err, response) {
                  if (err) {
                    reject('Bad Request');
                  } else {
                    resolve(response.body.link);
                  }
                });
            }
          });
      } catch (e) {
        console.log(e);
        reject(e.message ? e.message : e);
      }
    } else {
      reject('Not Online');
    }
  });
}

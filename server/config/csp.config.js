export const cspParams = {
  "default-src": ["'self'"],
  "connect-src": ["'self'", "https://api.openweathermap.org/", "https://restcountries.eu/rest/v2/all"],
  "style-src": ["'self'", "https: 'unsafe-inline'"],
  "font-src": ["'self'", "https: data:"],
  "script-src": ["'self'"],
  "object-src": ["'none'"],
  "frame-src": ["'self'"],
  "img-src": [
    "'self'",
    "https://sofitel.accor.com/destinations/imagerie/roma-overview-1400x788-1-c962_1400x788.jpg",
    "https://images.unsplash.com/",
    "https://source.unsplash.com/",
    "https://cs.pikabu.ru/post_img/big/2013/05/13/6/1368428658_2109296800.jpg",
    "https://pbs.twimg.com/",
    "https://abs.twimg.com/"
  ],
}
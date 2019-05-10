const http = require('http');
const url = require('url');
const https = require('https');
const xml2js = require('xml2js');

const hostname = '127.0.0.1';
const port = 3000;
const defaultResponse =  { totalResults:0 }

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET'); 

  const urlParts = url.parse(req.url);

  const apiEndpoint = 'https://www.goodreads.com/search/index.xml?key='+
                       process.env.KEY+'&'+
                       urlParts.query;

  https.get(apiEndpoint, (resp) => {
  
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {

      xml2js.parseString(data, function (err, apiResult) {

        let selectedData = defaultResponse;

        if(!apiResult){
          res.end(JSON.stringify(selectedData));
          return;
        }

        const searchData = apiResult.GoodreadsResponse.search[0];
        const rawBookList = searchData.results[0].work;

        const books = [];

        rawBookList && rawBookList.forEach(function(data){
          let averageRating = data.average_rating[0];

          if(typeof averageRating === 'object'){
            averageRating = averageRating._
          }

          let originalPublicationYear =  data.original_publication_year[0];

          if(typeof originalPublicationYear === 'object'){
            originalPublicationYear = originalPublicationYear._
          }

          books.push({
            id: data.id[0]._,
            averageRating,
            ratingsCount: data.ratings_count[0]._,
            originalPublicationYear,
            author: data.best_book[0].author[0].name[0],
            title: data.best_book[0].title[0],
            smallImageUrl: data.best_book[0].small_image_url[0]
          })
        });

        selectedData = {
          totalResults: searchData['total-results'][0],
          queryTimeSeconds: searchData['query-time-seconds'][0],
          resultStart: searchData['results-start'][0],
          resultEnd: searchData['results-end'][0],
          results: books 
        }

        res.end(JSON.stringify(selectedData));
      });
    });

  }).on("error", (err) => {
    res.statusCode = 400;
    res.end({ ...defaultResponse, error: err.message });
  });

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
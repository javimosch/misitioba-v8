
//var apiURL = 'https://misitioba-express.herokuapp.com/api';
//var apiURL = 'http://localhost:3000/api';
var apiURL = 'http://localhost:5000/api';

reqwest({
  url: apiURL + '/count',
  //type: 'json',
  method: 'post',
  contentType: 'application/json',
  crossOrigin: true,
  data: JSON.stringify({
    model: 'ARTICLE'
  })
}).then(function(r) {

  console.log(r);

});
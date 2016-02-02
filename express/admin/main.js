reqwest({
  url: '/api/count',
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
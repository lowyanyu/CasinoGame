const express = require('express');
const routes = require('./routes/rest');

const app = express();

app.use('/rest', routes);
app.use(express.json());

app.listen(process.env.port || 8889, function(){
  console.log('now listening for requests on port 8889');
});

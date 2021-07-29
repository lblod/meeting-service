import { app, update, query, sparqlEscapeUri, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
});

app.delete('/:id', async function( req, res ) {
  debugger;
  const uri="http://data.lblod.info/id/zittingen/"+req.params.id;
  // Delete meeting attributes 
  let deleteQuery=`
  DELETE {
    ?s ?p ?o.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} ?p ?o.
    ?s ?p ?o.
  }
  `;
  const response=await update(deleteQuery);
  console.log(response);
  debugger;

  // Delete treatments, intermissions, participants, agenda points, votes
  
  // Keep documents

  // A backend service
});

app.use(errorHandler);
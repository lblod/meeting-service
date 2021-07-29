import { app, update, query, sparqlEscapeUri, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
});

app.delete('/:id', async function( req, res ) {
  const uri="http://data.lblod.info/id/zittingen/"+req.params.id;
    
  // Keep documents
  const updateQuery=`
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX dct: <http://purl.org/dc/terms/>
  DELETE {
    ?containerId ext:editorDocumentStatus ?statusId.
  }
  INSERT {
    ?containerId ext:editorDocumentStatus <http://mu.semte.ch/application/concepts/a1974d071e6a47b69b85313ebdcef9f7>. 
  }
  WHERE {
    ${sparqlEscapeUri(uri)} ?meetingP ?meetingO.    
    ?meetindId ?meetingP ?meetingO.

    ?meetingId besluit:behandelt ?apId.
    ?behandelingId dct:subject ?apId. 
    ?behandelingId ext:hasDocumentContainer ?containerId.
    ?containerId ext:editorDocumentStatus ?statusId.
  }
  `;
  let response=await update(updateQuery);
  
  const deleteQuery=`
  DELETE {
    ?meetindId ?meetingP ?meetingO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} ?meetingP ?meetingO.    
    ?meetindId ?meetingP ?meetingO.
  }
  `;
  response=await update(deleteQuery);
  
  res.sendStatus(204);
  //TODO: Delete treatments, intermissions, participants, agenda points, votes
});

app.use(errorHandler);
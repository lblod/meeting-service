import { app, update, query, sparqlEscapeUri, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
});

app.delete('/:id', async function( req, res ) {
  debugger;
  const uri="http://data.lblod.info/id/zittingen/"+req.params.id;
    
  // Keep documents
  const updateDocQuery=`
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
  let response=await update(updateDocQuery);
  console.log(response);
  
  //Delete votes
  const deleteVotesQuery=`
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  DELETE {
    ?voteId ?voteP ?voteO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    ?apId ?apP ?apO.
    ?treatmentId dct:subject ?apId.
    ?treatmentId besluit:heeftStemming ?voteId.
    ?voteId ?voteP ?voteO.
  }
  `;
  response=await update(deleteVotesQuery);
  console.log(response);

  //Delete treatments 
  const deleteTreatmentQuery=`
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  DELETE {
    ?treatmentId ?treatmentP ?treatmentO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    ?apId ?apP ?apO.
    ?treatmentId dct:subject ?apId.
    ?treatmentId ?treatmentP ?treatmentO.
  }
  `;
  response=await update(deleteTreatmentQuery);
  console.log(response);
  
  //Delete agenda points,
  const deleteApQuery=`
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  DELETE {
    ?apId ?apP ?apO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    ?apId ?apP ?apO.
  }
  `;
  response=await update(deleteApQuery);
  console.log(response);

  //Delete intermissions
  const deleteIntermissionQuery=`
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  DELETE {
    ?intermissionId ?intermissionP ?intermissionO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} ext:hasIntermission ?intermissionId.
    ?intermissionId ?intermissionP ?intermissionO.
  }
  `;
  response=await update(deleteIntermissionQuery);
  console.log(response);  

  //delete meeting
  const deleteMeetingQuery=`
  DELETE {
    ?meetindId ?meetingP ?meetingO.
  }
  WHERE {
    ${sparqlEscapeUri(uri)} ?meetingP ?meetingO.    
    ?meetindId ?meetingP ?meetingO.
  }
  `;
  response=await update(deleteMeetingQuery);
  console.log(response);
  res.sendStatus(204);
});

app.use(errorHandler);
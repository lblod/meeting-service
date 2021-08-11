import { app, update, query, sparqlEscapeUri, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
});

app.delete('/:id', async function( req, res ) {
  debugger;
  const meetingId="http://data.lblod.info/id/zittingen/"+req.params.id;
  
  // Get all needed ids
  const idQuery=`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX dct: <http://purl.org/dc/terms/>
    SELECT DISTINCT ?apId ?behandelingId ?voteId ?intermissionId ?containerId

    WHERE {
      OPTIONAL{
        ${sparqlEscapeUri(meetingId)} besluit:behandelt ?apId.
      }
      OPTIONAL{
        ${sparqlEscapeUri(meetingId)} ext:hasIntermission ?intermissionId.
      } 
      OPTIONAL{
        ?behandelingId dct:subject ?apId.
      }
      OPTIONAL{ 
        ?behandelingId besluit:heeftStemming ?voteId.
      }
      OPTIONAL{
        ?behandelingId ext:hasDocumentContainer ?containerId.
      }
    }
  `;
  let result;
  try {
    result=await query(idQuery);
  } catch (error) {
    console.log(error);
    return;
  }  

  let behandelingIds=[];
  let apIds=[];
  let voteIds=[];
  let intermissionIds=[];
  let containerIds=[];

  for(let i=0; i<result.results.bindings.length; i++){
    let element=result.results.bindings[i];
    
    if(element.behandelingId)
     behandelingIds.includes(element.behandelingId.value) ? null : behandelingIds.push(element.behandelingId.value);
    if (element.apId)
      apIds.includes(element.apId.value) ? null : apIds.push(element.apId.value)
    if(element.voteId)
      voteIds.includes(element.voteId.value) ? null : voteIds.push(element.voteId.value);
    if(element.intermissionId)
      intermissionIds.includes(element.intermissionId.value) ? null : intermissionIds.push(element.intermissionId.value);
    if(element.containerId)
      containerIds.includes(element.containerId.value) ? null : containerIds.push(element.containerId.value);
    
  }

  const queryIds={behandelingIds, apIds, voteIds, intermissionIds, containerIds}
  
  let containerUpdateQuery='';
  let containerDeleteQuery='';
  let deleteVotesQuery='';
  let deleteTreatmentQuery='';
  let deleteAgendaPointsQuery='';
  let deleteIntermissionQuery=''
  
  queryIds.containerIds.forEach((e, i)=>{
    containerUpdateQuery+=`
     ${sparqlEscapeUri(e)} ext:editorDocumentStatus <http://mu.semte.ch/application/concepts/a1974d071e6a47b69b85313ebdcef9f7>.
    `;
    containerDeleteQuery+=`
     ${sparqlEscapeUri(e)} ext:editorDocumentStatus ?statusId${i}.
    `;
  });
  
  queryIds.voteIds.forEach((e, i)=>{
    deleteVotesQuery+=`
     ${sparqlEscapeUri(e)} ?voteP${i} ?voteO${i}.
    `;
  });

  queryIds.behandelingIds.forEach((e, i)=>{
    deleteTreatmentQuery+=`
     ${sparqlEscapeUri(e)} ?treatmentP${i} ?treatmentO${i}.
    `;
  });

  queryIds.apIds.forEach((e, i)=>{
    deleteAgendaPointsQuery+=`
     ${sparqlEscapeUri(e)} ?apP${i} ?apO${i}.
    `;
  });

  queryIds.intermissionIds.forEach((e, i)=>{
    deleteIntermissionQuery+=`
     ${sparqlEscapeUri(e)} ?intermissionP${i} ?intermissionO${i}.
    `;
  });

  let deleteMeetingQuery=`
    ${sparqlEscapeUri(meetingId)} ?meetingP ?meetingO.
  `;

  const updateQuery=`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX dct: <http://purl.org/dc/terms/>
    DELETE {
      ${containerDeleteQuery}
      ${deleteVotesQuery}
      ${deleteTreatmentQuery}
      ${deleteAgendaPointsQuery}
      ${deleteIntermissionQuery}
      ${deleteMeetingQuery} 
    }
    INSERT{
      ${containerUpdateQuery}
    }
    WHERE{
      ${containerDeleteQuery}
      ${deleteVotesQuery}
      ${deleteTreatmentQuery}
      ${deleteAgendaPointsQuery}
      ${deleteIntermissionQuery}
      ${deleteMeetingQuery}
    }
  `;
  
  try {
    result=await update(updateQuery);
  } catch (error) {
    console.log(error);
    return;
  }  
    // debugger;
    // const uri="http://data.lblod.info/id/zittingen/"+req.params.id;
    // //Keep documents
    // const updateDocQuery=`
    // PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    // PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    // PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    // PREFIX dct: <http://purl.org/dc/terms/>
    // DELETE {
    //   ?containerId ext:editorDocumentStatus ?statusId.
    // }
    // INSERT {
    //   ?containerId ext:editorDocumentStatus <http://mu.semte.ch/application/concepts/a1974d071e6a47b69b85313ebdcef9f7>. 
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    //   ?behandelingId dct:subject ?apId. 
    //   ?behandelingId ext:hasDocumentContainer ?containerId.
    //   ?containerId ext:editorDocumentStatus ?statusId.
    // }
    // `;
    // let response=await update(updateDocQuery);
    // console.log(response);
    
    // //Delete votes
    // const deleteVotesQuery=`
    // PREFIX dct: <http://purl.org/dc/terms/>
    // PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    // DELETE {
    //   ?voteId ?voteP ?voteO.
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    //   ?treatmentId dct:subject ?apId.
    //   ?treatmentId besluit:heeftStemming ?voteId.
    //   ?voteId ?voteP ?voteO.
    // }
    // `;
    // response=await update(deleteVotesQuery);
    // console.log(response);

    // //Delete treatments 
    // const deleteTreatmentQuery=`
    // PREFIX dct: <http://purl.org/dc/terms/>
    // PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    // DELETE {
    //   ?treatmentId ?treatmentP ?treatmentO.
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    //   ?treatmentId dct:subject ?apId.
    //   ?treatmentId ?treatmentP ?treatmentO.
    // }
    // `;
    // response=await update(deleteTreatmentQuery);
    // console.log(response);
    
    // //Delete agenda points,
    // const deleteApQuery=`
    // PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    // DELETE {
    //   ?apId ?apP ?apO.
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} besluit:behandelt ?apId.
    //   ?apId ?apP ?apO.
    // }
    // `;
    // response=await update(deleteApQuery);
    // console.log(response);

    // //Delete intermissions
    // const deleteIntermissionQuery=`
    // PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    // DELETE {
    //   ?intermissionId ?intermissionP ?intermissionO.
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} ext:hasIntermission ?intermissionId.
    //   ?intermissionId ?intermissionP ?intermissionO.
    // }
    // `;
    // response=await update(deleteIntermissionQuery);
    // console.log(response);  

    // //delete meeting
    // const deleteMeetingQuery=`
    // DELETE {
    //   ${sparqlEscapeUri(uri)} ?meetingP ?meetingO.
    // }
    // WHERE {
    //   ${sparqlEscapeUri(uri)} ?meetingP ?meetingO.
    // }
    // `;
    // response=await update(deleteMeetingQuery);
    // console.log(response);
    // res.sendStatus(204);
});

app.use(errorHandler);
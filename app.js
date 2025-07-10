import { app, update, query, sparqlEscapeUri, errorHandler } from "mu";

app.get('/', function (req, res) {
	res.send("Hello mu-javascript-template");
});

app.delete('/:id', async function (req, res) {
	const meetingId = "http://data.lblod.info/id/zittingen/" + req.params.id;

	// check if meeting has any published resource linked to it
	const publishedResourceQuery = ` 
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX sign: <http://mu.semte.ch/vocabularies/ext/signing/>
		PREFIX bv: <http://data.vlaanderen.be/ns/besluitvorming#>
    SELECT ?o1
    WHERE {
      ${sparqlEscapeUri(meetingId)} besluit:heeftBesluitenlijst | ext:hasVersionedNotulen | ext:hasVersionedBehandeling | ^bv:isAgendaVoor ?o1 .
      ?o2 ext:publishesBesluitenlijst |ext:publishesNotulen | ext:publishesBehandeling | ext:publishesAgenda ?o1.
      ?o2 a sign:PublishedResource.
    }
  `;

	// Get all needed ids
	const deletionQuery = `
	  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
	  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
	  PREFIX dct: <http://purl.org/dc/terms/>
	  DELETE{
	    ?containerId ext:editorDocumentStatus ?statusId.
	    ?voteId ?voteP ?voteO.
	    ?behandelingId ?behandelingP ?behandelingO.
	    ?apId ?apP ?apO.
	    ?intermissionId ?intermissionP ?intermissionO.
	    ${sparqlEscapeUri(meetingId)} ?meetingP ?meetingO.
	  }
	  INSERT{
	    ?containerId ext:editorDocumentStatus <http://mu.semte.ch/application/concepts/a1974d071e6a47b69b85313ebdcef9f7>.
	  }
	  WHERE {
			{
				${sparqlEscapeUri(meetingId)} ?meetingP ?meetingO.
			}
			UNION
			{
				${sparqlEscapeUri(meetingId)} ext:hasIntermission ?intermissionId.
	      ?intermissionId ?intermissionP ?intermissionO.
			}
			UNION
			{
				${sparqlEscapeUri(meetingId)} besluit:behandelt ?apId.
	      ?apId ?apP ?apO.
	      ?behandelingId dct:subject ?apId.
				{
					?behandelingId ?behandelingP ?behandelingO.
				}
				UNION
				{
					?behandelingId ext:hasDocumentContainer ?containerId.
					?containerId ext:editorDocumentStatus ?statusId.
				}
				UNION
				{
					?behandelingId besluit:heeftStemming ?voteId.
	      	?voteId ?voteP ?voteO.
				}
			}
	  }
	`;
	try {
		const publishedResourcesResult = await update(publishedResourceQuery);
		if (publishedResourcesResult.results.bindings.length) {
			console.log(publishedResourcesResult.results.bindings);
			res.sendStatus(409);
		} else {
			await update(deletionQuery);
			res.sendStatus(204);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(404);
		return;
	}
});

app.use(errorHandler);

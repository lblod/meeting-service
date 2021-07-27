import {prefixMap} from "./support/prefixes";
import {app, query, sparqlEscapeString, sparqlEscapeUri} from "mu";
app.delete('/:id', function( req, res ) {
  const id=req.params.id;
  // Delete meeting attributes 

  Query=`
  DELETE {

  } 
  WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      <http://lblod.info/templates/39c31a7e-2ba9-11e9-88cf-83ebfda837dc> a <http://mu.semte.ch/vocabularies/ext/Template>;
      ?p ?o.
    }
  };
  `;
  
  // Delete treatments, participants, agenda points, votes

  // Keep documents

  // A backend service

  

  debugger;
});

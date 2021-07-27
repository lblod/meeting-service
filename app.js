import {prefixMap} from "./support/prefixes";
import {app, query, sparqlEscapeString, sparqlEscapeUri} from "mu";
app.get('/', function( req, res ) {
  res.send('hello world')
});
app.delete('/:id', function( req, res ) {
  // hello
});

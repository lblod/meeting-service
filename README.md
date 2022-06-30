# Meeting service

Microservice used in Gelinkt Notuleren which allows for deletion of meetings, which are resources with the type
http://data.vlaanderen.be/ns/besluit#Zitting. Before deletion, it ensures no published resources (http://mu.semte.ch/vocabularies/ext/signing/PublishedResource) are linked to the meeting.

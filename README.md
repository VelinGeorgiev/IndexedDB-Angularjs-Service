# IndexedDB-Angularjs-Service
This is a simple IndexedDB angularjs service that I have created for one of my projects for use in offline apps development. 
Hope than may be a shortcut to someone in developing Angularjs-IndexedDB apps.

I simply did not find any suitable factory for indexedDB and decided to create a simple service to do the job.

Usage:

First in the Service init method define your object stores and then access them with the dbService methods like on the example bellow.

dbService.getByIndex('games', 'owner_idx', $rootScope.user.id).then(
    function (games) {
                //array of game objects returned
    },
    function (error) {
               console.log(error);
    }
);

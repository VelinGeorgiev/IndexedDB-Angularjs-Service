 IndexedDB-Angularjs-Service
 ==========================

![build status](https://img.shields.io/pypi/status/Django.svg)

This is a simple IndexedDB angularjs service that I have created for one of my projects for use in offline apps development.
Hope that may be a shortcut to someone developing Angularjs IndexedDB apps.

I simply did not find any suitable factory for indexedDB and decided to create a simple service to do the job.

## Usage

First in the Service `init` method define your object stores

```javascript
  var gameStore = db.createObjectStore("games", { keyPath: "id" });
  gameStore.createIndex("id_idx", "id", { unique: true });
  gameStore.createIndex("data_idx", "data", { unique: false });
  gameStore.createIndex("createdBy_idx", "createdBy", { unique: false });
```
and then access them with the `dbService` methods like on the example bellow.

```javascript
dbService.getByIndex('games', 'owner_idx', $rootScope.user.id).then(
    function (games) {
                //array of game objects returned
    },
    function (error) {
               console.log(error);
    }
);
```

## Load

To insert multiple records in the database, call `addall` method.
```javascript
var gamelist = [
  {id:1, data:"", createdBy:"", extra:"",rate:2.5 },
  {id:1, data:"", createdBy:"", extra:"",rate:3.5 },
  {id:1, data:"", createdBy:"", extra:"",rate:1.5 },
  ...
];
dbService.addall('games', gamelist).then(function (total) {
    console.log("total records inserted: ", total);
    //
},function (error) {
    // $q Rejection
    console.log(error);
});
```

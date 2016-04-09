angular.module('app').factory('dbService', [
    '$q', function($q) {
        return {
            init: function() {
                var deferred = $q.defer();

                var request = indexedDB.open("db");

                request.onupgradeneeded = function() {
                    // The database did not previously exist, so create object stores and indexes.
                    var db = request.result;
                    var gameStore = db.createObjectStore("games", { keyPath: "id" });
                    gameStore.createIndex("id_idx", "id", { unique: true });
                    gameStore.createIndex("data_idx", "data", { unique: false });
                    gameStore.createIndex("createdBy_idx", "createdBy", { unique: false });

                    var resultsStore = db.createObjectStore("results", { keyPath: "id" });
                    resultsStore.createIndex("id_idx", "id", { unique: true });
                    resultsStore.createIndex("gameId_idx", "gameId", { unique: false });
                    resultsStore.createIndex("userId_idx", "userId", { unique: false });

                    var usersStore = db.createObjectStore("users", { keyPath: "id" });
                    usersStore.createIndex("id_idx", "id", { unique: true });
                    usersStore.createIndex("token_idx", "token", { unique: false });

                    var syncStore = db.createObjectStore("syncs", { keyPath: "id" });
                    syncStore.createIndex("id_idx", "id", { unique: true });
                    syncStore.createIndex("created_idx", "created", { unique: false });
                    syncStore.createIndex("createdBy_idx", "createdBy", { unique: false });
                };

                request.onsuccess = function() {
                    deferred.resolve(request.result);
                };

                request.onerror = function() {
                    deferred.reject(request.error);
                };

                return deferred.promise;
            },
            add: function(storeName, entity) {
                var deferred = $q.defer();

                var add = function(db) {

                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);

                    store.add(entity);

                    tx.oncomplete = function(e) {
                        // All requests have succeeded and the transaction has committed.
                        deferred.resolve(entity.id);
                    };

                    tx.onerror = function(ex) {
                        deferred.reject(ex);
                    };
                    tx.onabort = function(ex) {
                        deferred.reject(ex);
                    };

                    //db.close();
                }

                this.init().then(add);

                return deferred.promise;
            },
            addall: function(storeName, entity) {
                var deferred = $q.defer();

                var add = function(db) {

                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);
										var count=0;
                    //Insert several objects: [{obj},{obj},{obj}]
										for(var i= 0; i< entity.length; i++){
                    	store.add(entity[i]);
											count++;
										}
                    tx.oncomplete = function(e) {
                        // All requests have succeeded and the transaction has committed.
                        deferred.resolve(count);
                    };

                    tx.onerror = function(ex) {
                        deferred.reject(ex);
                    };
                    tx.onabort = function(ex) {
                        deferred.reject(ex);
                    };

                    //db.close();
                }

                this.init().then(add);

                return deferred.promise;
            },
            put: function(storeName, entity) {
                var deferred = $q.defer();

                var put = function(db) {

                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);

                    store.put(entity);

                    tx.oncomplete = function() {
                        // All requests have succeeded and the transaction has committed.
                        deferred.resolve(tx.result);
                    };

                    tx.onerror = function() {
                        deferred.reject(tx);
                    };
                    tx.onabort = function() {
                        deferred.reject(tx);
                    };
                }

                this.init().then(put);

                return deferred.promise;
            },
            getById: function(storeName, id) {
                var deferred = $q.defer();

                var getById = function(db) {

                    var tx = db.transaction(storeName, "readonly");
                    var store = tx.objectStore(storeName);
                    var index = store.index("id_idx");

                    var request = index.get(id);

                    request.onsuccess = function() {
                        deferred.resolve(request.result);
                    };

                    request.onerror = function() {
                        deferred.reject(request.error);
                    };
                    tx.onabort = function() {
                        deferred.reject(tx.error);
                    };
                }

                this.init().then(getById);

                return deferred.promise;
            },
            getByIndex: function(storeName, indexName, value) {
                var deferred = $q.defer();

                var getByIndex = function(db) {

                    var tx = db.transaction(storeName, "readonly");
                    var store = tx.objectStore(storeName);
                    var index = store.index(indexName);
                    var request = index.openCursor(IDBKeyRange.only(value)); //IDBKeyRange.only(value)
                    var results = [];
                    request.onsuccess = function() {
                        var cursor = request.result;
                        if (cursor) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            deferred.resolve(results);
                        }
                    };
                    request.onerror = function(r) {
                        deferred.reject(r.error);
                    };
                    tx.onabort = function(r) {
                        deferred.reject(r.error);
                    };
                }

                this.init().then(getByIndex);

                return deferred.promise;
            },
            all: function(storeName, indexName) {
                var deferred = $q.defer();
                if (indexName === undefined) indexName = 'id_idx';

                var all = function(db) {
                    var tx = db.transaction(storeName, "readonly");
                    var store = tx.objectStore(storeName);
                    var index = store.index(indexName);

                    var request = index.openCursor(); //IDBKeyRange.only("Fred")
                    var results = [];
                    request.onsuccess = function() {
                        var cursor = request.result;
                        if (cursor) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            deferred.resolve(results);
                        }
                    };
                    request.onerror = function() {
                        deferred.reject(request.error);
                    };
                    tx.onabort = function() {
                        deferred.reject(tx.error);
                    };
                }

                this.init().then(all);

                return deferred.promise;
            },
            count: function(storeName, indexName) {
                var deferred = $q.defer();
                if (indexName === undefined) indexName = 'id_idx';

                var count = function(db) {
                    var tx = db.transaction(storeName, "readonly");
                    var store = tx.objectStore(storeName);
                    var index = store.index(indexName);

                    var request = index.count();
                    request.onsuccess = function() {
                        deferred.resolve(request.result);
                    };
                    request.onerror = function() {
                        deferred.reject(request.error);
                    };
                    tx.onabort = function() {
                        deferred.reject(tx.error);
                    };
                }

                this.init().then(count);

                return deferred.promise;
            },
            remove: function(storeName, id) {
                var deferred = $q.defer();

                var remove = function(db) {

                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);

                    store.delete(id);

                    tx.oncomplete = function(e) {
                        // All requests have succeeded and the transaction has committed.
                        deferred.resolve(id);
                    };

                    tx.onerror = function(r) {
                        deferred.reject(r.error);
                    };
                    tx.onabort = function(r) {
                        deferred.reject(r.error);
                    };

                    //db.close();
                }

                this.init().then(remove);

                return deferred.promise;
            },
            removeByIndex: function(storeName, indexName, value) {
                var deferred = $q.defer();

                var removeByIndex = function(db) {

                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);
                    var index = store.index(indexName);
                    var request = index.openKeyCursor(IDBKeyRange.only(value)); //IDBKeyRange.only(value)
                    var results = [];

                    request.onsuccess = function() {
                        var cursor = request.result;
                        if (cursor) {
                            store.delete(cursor.primaryKey);
                            cursor.continue();
                        } else {
                            deferred.resolve(results);
                        }
                    };
                    request.onerror = function(r) {
                        deferred.reject(r.error);
                    };
                    tx.onabort = function(r) {
                        deferred.reject(r.error);
                    };
                }

                this.init().then(removeByIndex);

                return deferred.promise;
            },
            last: function(storeName, indexName, limit, value) {
                var deferred = $q.defer();

                var getByIndex = function(db) {

                    var tx = db.transaction(storeName, "readonly");
                    var store = tx.objectStore(storeName);
                    var index = store.index(indexName);

                    var keyRange = null;
                    if (value) keyRange = IDBKeyRange.only(value);
                    var request = index.openCursor(keyRange, "prev");
                    var results = [];
                    var count = 0;

                    request.onsuccess = function() {
                        count++;
                        var cursor = request.result;
                        if (cursor && count <= limit) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            deferred.resolve(results);
                        }
                    };
                    request.onerror = function(r) {
                        deferred.reject(r.error);
                    };
                    tx.onabort = function(r) {
                        deferred.reject(r.error);
                    };
                }

                this.init().then(getByIndex);

                return deferred.promise;


            }
        };
    }
]);

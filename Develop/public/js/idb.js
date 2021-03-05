//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || 
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange

if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let request = window.indexedDB.open("transactions", 1);

let db;
request.onerror=function(event) {
    console.log("indexDbError");
}
request.onsuccess=function(event) {
    db=request.result;
    console.log("success:", db);
    if (navigator.onLine) {
        uploadData()
    }
}
request.onupgradeneeded=function(event) {
    const db = event.target.result;

    db.createObjectStore('transactions', {autoIncrement: true});
}


function saveRecord (transaction) {

    const tran = db.transaction([`transactions`], 'readwrite');

    const dataObjectStore = tran.objectStore('transactions');

    dataObjectStore.add(transaction)
     
}

function uploadData() {
    const transaction = db.transaction(['transactions'], 'readwrite');

    const dataObjectStore = transaction.objectStore('transactions');

    const getAll = dataObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['transactions'], 'readwrite');

                const dataObjectStore = transaction.objectStore('transactions');

                dataObjectStore.clear();

                alert('All saved financial info has been saved');
            })
            .catch(err => {
                console.log(err);
            })
        }
    };
}


window.addEventListener("online", uploadData)
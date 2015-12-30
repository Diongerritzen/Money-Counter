var app = angular.module('MoneyCounterApp', []);
app.controller('TransactionsController', function ($scope, $http, jsonPointerParseService, TransactionsService, CategoriesService) {
    var url = 'http://localhost:52709/api/Transactions';
    
    $scope.transactionList = {};
    $scope.categoryList = {};
    
    getTransactionList();
    getCategoryList();
    
    // default values for add transaction form
    $scope.newTransactionDate = new Date();
    $scope.newTransactionCategory = '1';
    $scope.newTransactionType = 'Expense';
    $scope.showEditForm = false;
    $scope.editableTransaction = {};
    
    $scope.addTransaction = function () {
        var date = $scope.newTransactionDate;
        var utcdate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        var newTransaction = {
            Date: utcdate,
            Categories: [{ Id: $scope.newTransactionCategory }],
            Description: $scope.newTransactionDescription,
            Amount: $scope.newTransactionAmount,
            Type: $scope.newTransactionType,
            User: { Id: 1 }
        };

        $http.post(url, newTransaction)
            .success(function () {
                getTransactionList();
            })
            .error(function () {
                alert("failure in addTransaction");
            });
    
        $scope.newTransactionDate = new Date();
        $scope.newTransactionCategory = '1';
        $scope.newTransactionDescription = '';
        $scope.newTransactionAmount = '';
    }
    
    $scope.showEditTransaction = function (transaction)
    {
        $scope.editTransactionDate = new Date(transaction.Date);
        $scope.editTransactionCategory = transaction.Categories[0].Id + '';
        $scope.editTransactionDescription = transaction.Description;
        $scope.editTransactionAmount = parseFloat(transaction.Amount);
        $scope.editTransactionType = transaction.Type;

        $scope.editableTransaction = transaction;
        $scope.showEditForm = true;
    }

    $scope.cancelEditTransaction = function ()
    {
        $scope.editableTransaction = {};
        $scope.showEditForm = false;
    }

    $scope.editTransaction = function ()
    {
        var date = $scope.editTransactionDate;
        var utcdate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        var editedTransaction = {
            Date: utcdate,
            Categories: [{ Id: $scope.editTransactionCategory }],
            Description: $scope.editTransactionDescription,
            Amount: $scope.editTransactionAmount,
            Type: $scope.editTransactionType,
            User: { Id: $scope.editableTransaction.User.Id },
            Id: $scope.editableTransaction.Id
        };

        $http.put(url + '/' + editedTransaction.Id, editedTransaction)
            .success(function () {
                getTransactionList();
            })
            .error(function () {
                alert('failure in editTransaction');
            });


        $scope.editableTransaction = {};
        $scope.showEditForm = false;
    }

    $scope.deleteTransaction = function (id) {
        $http.delete(url + '/' + id)
            .success(function () {
                getTransactionList();
            })
            .error(function () {
                alert('failure in deleteTask');
            });
    }
    
    function getTransactionList() {
        TransactionsService.getList()
            .success(function (data) {
                $scope.transactionList = jsonPointerParseService.pointerParse(data, 5);
    
                angular.forEach($scope.transactionList, function (transaction, index) {
                    $scope.transactionList[index].Amount = transaction.Amount.toFixed(2);
                    $scope.transactionList[index].Date = moment(transaction.Date).format('L');
                });
            })
            .error(function () {
                alert('error from init');
            });
    }
    
    function getCategoryList() {
        CategoriesService.getList()
            .success(function (data) {
                $scope.categoryList = jsonPointerParseService.pointerParse(data, 5);
            })
            .error(function (data) {
                console.log(data);
            });
    }
});

app.controller('StatisticsController', function ($scope, $http) {

});

app.controller('RecurrencesController', function ($scope, $http) {

});

app.controller('CategoriesController', function ($scope, $http) {

});

app.factory('TransactionsService', function ($http) {
    var url = 'http://localhost:52709/api/Transactions';
    var service = {
        getList: function () {
            return $http.get(url);
        }
    };

    return service;
});

app.factory('CategoriesService', function ($http, jsonPointerParseService) {
    var url = 'http://localhost:52709/api/Categories';
    var service = {
        getList: function () {
            return $http.get(url);
        }
    };

    return service;
});

// http://programmers.stackexchange.com/questions/254481/how-do-i-resolve-ref-in-a-json-object
app.factory('jsonPointerParseService', function () {
    var hashOfObjects = {};

    var service = {
        pointerParse: pointerParse
    };

    return service;

    function collectIds(obj) {
        if (jQuery.type(obj) === "object") {
            if (obj.hasOwnProperty("$id")) {
                hashOfObjects[obj.$id] = obj;
            }
            for (var prop in obj) {
                collectIds(obj[prop]);
            }
        } else if (jQuery.type(obj) === "array") {
            obj.forEach(function (element) {
                collectIds(element);
            });
        }
    }

    function setReferences(obj) {
        if (jQuery.type(obj) === "object") {
            for (var prop in obj) {
                if (jQuery.type(obj[prop]) === "object" &&
                    obj[prop].hasOwnProperty("$ref")) {
                    obj[prop] = hashOfObjects[obj[prop]["$ref"]];
                } else {
                    setReferences(obj[prop]);
                }
            }
        } else if (jQuery.type(obj) === "array") {
            obj.forEach(function (element, index, array) {
                if (jQuery.type(element) === "object" &&
                    element.hasOwnProperty("$ref")) {
                    array[index] = hashOfObjects[element["$ref"]];
                } else {
                    setReferences(element);
                }
            });
        }
    }

    // Set the max depth of your object graph because JSON.stringify will not be able to
    // serialize a large object graph back to 
    function setMaxDepth(obj, depth) {
        // If this is not an object or array just return there is no need to 
        // set its max depth.
        if (jQuery.type(obj) !== "array" && jQuery.type(obj) !== "object") {
            return obj;
        }

        var newObj = {};

        // If this object was an array we want to return the same type in order
        // to keep this variable's consistency.
        if (jQuery.type(obj) === "array") {
            newObj = [];
        }

        // For each object or array cut off its tree at the depth value by 
        // recursively diving into the tree.
        angular.forEach(obj, function (value, key) {
            if (depth == 1) {
                newObj = null;
            }
            else if (jQuery.type(value) === "array") {
                if (setMaxDepth(value, depth - 1)) {
                    newObj[key] = setMaxDepth(value, depth - 1)
                } else {
                    newObj = [];
                }
            } else if (jQuery.type(value) === "object") {
                if (setMaxDepth(value, depth - 1)) {
                    newObj[key] = setMaxDepth(value, depth - 1)
                } else {
                    newObj = [];
                }
            } else {
                newObj[key] = value;
            }
        }, newObj);

        return newObj;
    }

    function pointerParse(obj, depth) {
        var newObj = obj;

        hashOfObjects = {};
        collectIds(newObj);
        setReferences(newObj);

        if (depth) {
            newObj = setMaxDepth(newObj, depth);
        }

        return newObj;
    }
});

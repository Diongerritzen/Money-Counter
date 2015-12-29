var app = angular.module('MoneyCounterApp', []);
app.controller('TransactionsController', function ($scope, $http, jsonPointerParseService) {
    var url = 'http://localhost:52709/api/Transactions';

    getTransactionList();

    $scope.addTransaction = function () {
        var newTransaction = {
            Date: $scope.newTransactionDate,
            Category: $scope.newTransactionCategory,
            Description: $scope.newTransactionDescription,
            Amount: $scope.newTransactionAmount,
            User: 1
        }
        $http.post(url, newTransaction)
            .success(function () {
                getTransactionList();
            })
            .error(function () {
                alert("failure in addTransaction");
            });

        $scope.newTransactionDate = Date();
        $scope.newTransactionCategory = '';
        $scope.newTransactionDescription = '';
        $scope.newTransactionAmount = '0.00';
    }

    function getTransactionList()
    {
        $http.get(url)
        .success(function (data, status, header, config) {

            $scope.transactionList = jsonPointerParseService.pointerParse(data, 5);
            //var ids = collectIds(data);
            //$scope.transactionList = data;
            
            angular.forEach($scope.transactionList, function (transaction, index) {
                $scope.transactionList[index].Amount = transaction.Amount.toFixed(2);
            //    var ids = findReferenceIds(transaction);
            //    angular.forEach(transaction.Categories, function (category, catIndex) {
            //        if ('$ref' in category)
            //        {
            //            category = ids[category.$ref];
            //        }
            //        $scope.transactionList[index].Categories[catIndex] = category;
            //    });
            });
        })
        .error(function () {
            alert('error from init');
        });
    }
});

app.controller('StatisticsController', function ($scope, $http) {

});

app.controller('RecurrencesController', function ($scope, $http) {

});

app.controller('CategoriesController', function ($scope, $http) {

});

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

var app = angular.module('MoneyCounterApp', []);
app.controller('TransactionsController', function ($scope, $http, jsonPointerParseService, TransactionsService, CategoriesService) {
    var url = 'http://localhost:52709/api/Transactions';
    
    $scope.transactionList = {};
    $scope.categoryExpenseList = {};
    $scope.categoryIncomeList = {};
    
    getTransactionList();
    getCategoryLists();
    
    // default values for add/edit transaction form
    $scope.transactionDateInput = new Date();
    $scope.transactionCategoryInput = '2';
    $scope.transactionTypeInput = 'Expense';
    $scope.transactionOrdering = 'Date';
    $scope.showEditForm = false;
    $scope.editableTransaction = {};

    $scope.setDefaultCategory = function () {
        $scope.transactionCategoryInput = $scope.transactionTypeInput == 'Expense' ? ('' + $scope.categoryExpenseList[0].Id) : ('' + $scope.categoryIncomeList[0].Id);
    }

    $scope.addTransaction = function () {
        var date = $scope.transactionDateInput;
        var utcdate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        var newTransaction = {
            Date: utcdate,
            Category: { Id: $scope.transactionCategoryInput },
            Description: $scope.transactionDescriptionInput,
            Amount: $scope.transactionAmountInput,
            Type: $scope.transactionTypeInput,
            User: { Id: 1 }
        };

        $http.post(url, newTransaction)
            .success(function () {
                getTransactionList();
            })
            .error(function () {
                alert("failure in addTransaction");
            });
    
        $scope.transactionDateInput = new Date();
        $scope.setDefaultCategory();
        $scope.transactionDescriptionInput = '';
        $scope.transactionAmountInput = '';
    }
    
    $scope.showEditTransaction = function (transaction)
    {
        $scope.transactionDateInput = new Date(transaction.Date);
        $scope.transactionCategoryInput = transaction.Category.Id + '';
        $scope.transactionDescriptionInput = transaction.Description;
        $scope.transactionAmountInput = parseFloat(transaction.Amount);
        $scope.transactionTypeInput = transaction.Type;

        $scope.editableTransaction = transaction;
        $scope.showEditForm = true;
    }

    $scope.closeEditTransaction = function ()
    {
        $scope.transactionDateInput = new Date();
        $scope.setDefaultCategory();
        $scope.transactionDescriptionInput = '';
        $scope.transactionAmountInput = '';
        $scope.transactionTypeInput = 'Expense';
        
        $scope.editableTransaction = {};
        $scope.showEditForm = false;
    }

    $scope.editTransaction = function ()
    {
        var date = $scope.transactionDateInput;
        var utcdate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        var editedTransaction = {
            Date: utcdate,
            Category: { Id: $scope.transactionCategoryInput },
            Description: $scope.transactionDescriptionInput,
            Amount: $scope.transactionAmountInput,
            Type: $scope.transactionTypeInput,
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


        $scope.closeEditTransaction();
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
                    $scope.transactionList[index].Date = moment(transaction.Date).format('L');
                });
            })
            .error(function () {
                alert('error from init');
            });
    }
    
    function getCategoryLists() {
        CategoriesService.getListByType('Expense')
            .success(function (data) {
                $scope.categoryExpenseList = jsonPointerParseService.pointerParse(data, 5);
            })
            .error(function (data) {
                console.log(data);
            });
        CategoriesService.getListByType('Income')
            .success(function (data) {
                $scope.categoryIncomeList = jsonPointerParseService.pointerParse(data, 5);
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
        },
        getListByType: function (type) {
            return $http.get(url, { params: { type: type } });
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

var app = angular.module('MoneyCounterApp', []);
app.controller('AppController', function ($rootScope, $scope, jsonPointerParseService, TransactionsService, CategoriesService) {
    $rootScope.transactionList = {};
    $rootScope.categoryList = {};
    $scope.visibleView = 'Transactions';

    $rootScope.refreshTransactionList = function () {
        TransactionsService.getList()
            .success(function (data) {
                $rootScope.transactionList = jsonPointerParseService.pointerParse(data, 5);

                angular.forEach($rootScope.transactionList, function (transaction, index) {
                    $rootScope.transactionList[index].Date = moment(transaction.Date).format('L');
                });
            })
            .error(function () {
                alert('error from init');
            });
    };

    $rootScope.refreshCategoryList = function () {
        CategoriesService.getList()
            .success(function (data) {
                $rootScope.categoryList = jsonPointerParseService.pointerParse(data, 5);
            })
            .error(function (data) {
                console.log(data);
            });
    };

    
});

app.controller('TransactionsController', function ($rootScope, $scope, $http) {
    var url = 'http://localhost:52709/api/Transactions';
    
    $rootScope.refreshTransactionList();
    $rootScope.refreshCategoryList();
    
    // default values for add/edit transaction form
    $scope.transactionDateInput = new Date();
    $scope.transactionCategoryInput = '1';
    $scope.transactionTypeInput = 'expense';

    $scope.transactionOrdering = 'Date';
    $scope.showEditForm = false;
    $scope.editableTransaction = {};

    $scope.setDefaultCategory = function () {
        $scope.transactionCategoryInput = $scope.transactionTypeInput == 'expense' ? ('' + $rootScope.categoryList[0].Id) : ('' + $rootScope.categoryList[1].Id);
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
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert("failure in addTransaction");
            });
    
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
        $scope.transactionTypeInput = 'expense';
        
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
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert('failure in editTransaction');
            });


        $scope.closeEditTransaction();
    }

    $scope.deleteTransaction = function (id) {
        $http.delete(url + '/' + id)
            .success(function () {
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert('failure in deleteTask');
            });
    }
});

app.controller('StatisticsController', function ($scope, $http) {

});

app.controller('RecurrencesController', function ($scope, $http) {

});

app.controller('CategoriesController', function ($rootScope, $scope, $http) {
    var url = 'http://localhost:52709/api/Categories';

    $rootScope.refreshCategoryList();
    
    // default values for add/edit category form
    $scope.categoryTypeInput = 'expense';
    $scope.categoryColorInput = '#000';

    $scope.showEditForm = false;

    $scope.addCategory = function () {
        var newCategory = {
            Name: $scope.categoryNameInput,
            TransactionType: $scope.categoryTypeInput,
            Color: $scope.categoryColorInput,
            User: { Id: 1 }
        };

        $http.post(url, newCategory)
            .success(function () {
                $rootScope.refreshCategoryList();
            })
            .error(function () {
                alert("failure in addCategory");
            });

        $scope.categoryNameInput = '';
    }
    
    $scope.editCategory = function () {
        
    }
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

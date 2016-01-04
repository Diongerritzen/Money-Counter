var app = angular.module('MoneyCounterApp', ['ngAnimate']);
app.controller('AppController', function ($rootScope, $scope, jsonPointerParseService, TransactionsService, CategoriesService) {
    $rootScope.transactionList = [];
    $rootScope.categoryList = [];
    $rootScope.dateList = [];
    $scope.visibleView = 'Transactions';

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $rootScope.refreshTransactionList = function () {
        TransactionsService.getList()
            .success(function (data) {
                $rootScope.transactionList = jsonPointerParseService.pointerParse(data, 5);
                $rootScope.dateList = [];
                angular.forEach($rootScope.transactionList, function (transaction) {
                    var date = new Date(transaction.Date);
                    var year = date.getFullYear();
                    var month = date.getMonth();

                    var yearIndex = $rootScope.dateList.findIndex(function (element) {
                        return (element.Value === year);
                    });

                    if (yearIndex === -1)
                    {
                        $rootScope.dateList.push({ Value: year, Months: [{ Value: month, Name: monthNames[month] }] });
                    }
                    else
                    {
                        var monthIndex = $rootScope.dateList[yearIndex].Months.findIndex(function (element) {
                            return (element.Value === month);
                        });
                        if (monthIndex === -1)
                        {
                            $rootScope.dateList[yearIndex].Months.push({ Value: month, Name: monthNames[month] });
                            $rootScope.dateList[yearIndex].Months.sort(function (a, b) {
                                return b.Value - a.Value;
                            })
                        }
                    }
                    $rootScope.dateList.sort(function (a, b) {
                        return b.Value - a.Value;
                    })
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

    $rootScope.formatDate = function (date) {
        return (new Date(date)).toLocaleDateString();
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

    $scope.transactionOrdering = '-Date';
    $scope.showEditForm = false;
    $scope.editableTransaction = {};

    $scope.setDefaultCategory = function () {
        $scope.transactionCategoryInput = $scope.transactionTypeInput === 'expense' ? ('' + $rootScope.categoryList[0].Id) : ('' + $rootScope.categoryList[1].Id);
    };

    $scope.addTransaction = function () {
        var date = $scope.transactionDateInput;
        var utcdate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        var newTransaction = {
            Date: utcdate,
            Category: { Id: $scope.transactionCategoryInput },
            Description: $scope.transactionDescriptionInput,
            Amount: parseFloat($scope.transactionAmountInput),
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
    };
    
    $scope.showEditTransaction = function (transaction) {
        $scope.transactionDateInput = new Date(transaction.Date);
        $scope.transactionCategoryInput = transaction.Category.Id + '';
        $scope.transactionDescriptionInput = transaction.Description;
        $scope.transactionAmountInput = parseFloat(transaction.Amount);
        $scope.transactionTypeInput = transaction.Type;

        $scope.editableTransaction = transaction;
        $scope.showEditForm = true;
    };

    $scope.closeEditTransaction = function () {
        $scope.transactionDateInput = new Date();
        $scope.transactionDescriptionInput = '';
        $scope.transactionAmountInput = '';
        $scope.transactionTypeInput = 'expense';
        $scope.setDefaultCategory();

        $scope.editableTransaction = {};
        $scope.showEditForm = false;
    };

    $scope.editTransaction = function () {
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
    };

    $scope.deleteTransaction = function (id) {
        $http.delete(url + '/' + id)
            .success(function () {
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert('failure in deleteTask');
            });
    };
});

app.controller('StatisticsController', function ($rootScope, $scope, $http, TransactionsService) {
    $scope.yearIndex = '0';//(new Date()).getFullYear() + '';
    $scope.monthIndex = '0';//(new Date()).getMonth() + '';

    $scope.getDaysInMonth = daysInMonth;
    $scope.getDaysInYear = daysInYear;

    $scope.getTypeTotal = function (type, time) {
        var transactions = filterTransactions(type, time);

        var total = 0;
        angular.forEach(transactions, function (transaction) {
            total += transaction.Amount;
        });

        return total.toFixed(2);
    }

    $scope.getMin = function (type, time) {
        var transactions = filterTransactions(type, time);

        var min = Number.MAX_VALUE;
        angular.forEach(transactions, function (transaction) {
            if (transaction.Amount < min)
            {
                min = transaction.Amount;
            }
        });

        if (min === Number.MAX_VALUE) {
            min = 0;
        }

        return min.toFixed(2);
    };

    $scope.getMax = function (type, time) {
        var transactions = filterTransactions(type, time);

        var max = Number.MIN_VALUE;
        angular.forEach(transactions, function (transaction) {
            if (transaction.Amount > max)
            {
                max = transaction.Amount;
            }
        });

        if (max === Number.MIN_VALUE)
        {
            max = 0;
        }

        return max.toFixed(2);
    };

    $scope.getAverage = function (type, time) {
        var days = time === 'year' ? daysInYear() : daysInMonth();

        if (days === 0)
        {
            days = 1;
        }
        
        return (parseFloat($scope.getTypeTotal(type, time)) / days).toFixed(2);
    };

    $scope.getTotal = function (time) {
        return (parseFloat($scope.getTypeTotal('income', time)) - parseFloat($scope.getTypeTotal('expense', time))).toFixed(2);
    };

    function filterTransactions(type, time) {
        if ($rootScope.dateList.length < 1)
        {
            return [];
        }

        var year = $rootScope.dateList[$scope.yearIndex].Value;
        var transactions = [];
        if (time === 'year')
        {
            transactions = $rootScope.transactionList.filter(function (transaction) {
                var date = new Date(transaction.Date);
                return transaction.Type === type && date.getFullYear();
            });
        }
        else
        {
            var month = $rootScope.dateList[$scope.yearIndex].Months[$scope.monthIndex].Value;
            transactions = $rootScope.transactionList.filter(function (transaction) {
                var date = new Date(transaction.Date);
                return transaction.Type === type && date.getFullYear() === year && date.getMonth() === month;
            });
        }

        return transactions;
    }

    function daysInMonth() {
        if ($rootScope.dateList.length < 1)
        {
            return 0;
        }

        var year = $rootScope.dateList[$scope.yearIndex].Value;
        var month = $rootScope.dateList[$scope.yearIndex].Months[$scope.monthIndex].Value;

        return new Date(year, month + 1, 0).getDate();
    }

    function daysInYear() {
        if ($rootScope.dateList.length < 1)
        {
            return 0;
        }

        var year = $rootScope.dateList[$scope.yearIndex].Value;
        var days = 0;
        for (var month = 0; month < 12; month++)
        {
            days += new Date(year, month + 1, 0).getDate();
        }

        return days;
    }
});

app.controller('RecurrencesController', function ($scope, $http) {

});

app.controller('CategoriesController', function ($rootScope, $scope, $http) {
    var url = 'http://localhost:52709/api/Categories';

    $rootScope.refreshCategoryList();
    
    // default values for add/edit category form
    $scope.categoryTypeInput = 'expense';
    $scope.categoryColorInput = '#000000';

    $scope.showEditForm = false;
    $scope.editableCategory = {};

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
    };
    
    $scope.showEditCategory = function (category) {
        $scope.categoryNameInput = category.Name;
        $scope.categoryTypeInput = category.TransactionType;
        $scope.categoryColorInput = category.Color;

        $scope.editableCategory = category;
        $scope.showEditForm = true;
    };

    $scope.closeEditCategory = function () {
        $scope.categoryNameInput = '';
        $scope.categoryTypeInput = 'expense';
        $scope.categoryColorInput = '#000000';

        $scope.editableCategory = {};
        $scope.showEditForm = false;
    };

    $scope.editCategory = function () {
        var editedCategory = {
            Name: $scope.categoryNameInput,
            TransactionType: $scope.categoryTypeInput,
            Color: $scope.categoryColorInput,
            User: { Id: $scope.editableCategory.User.Id },
            Id: $scope.editableCategory.Id
        };

        $http.put(url + '/' + editedCategory.Id, editedCategory)
            .success(function () {
                $rootScope.refreshCategoryList();
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert('failure in editTransaction');
            });

        $scope.closeEditCategory();
    };

    $scope.deleteCategory = function (id) {
        $http.delete(url + '/' + id)
            .success(function () {
                $rootScope.refreshCategoryList();
                $rootScope.refreshTransactionList();
            })
            .error(function () {
                alert('failure in deleteTask');
            });

    };
});

app.factory('TransactionsService', function ($http) {
    var url = 'http://localhost:52709/api/Transactions';
    var service = {
        getList: function () {
            return $http.get(url);
        },
        getListByYearMonth: function (year, month) {
            return $http.get(url, { params: { year: year, month: month } });
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

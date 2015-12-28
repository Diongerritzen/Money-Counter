var app = angular.module('MoneyCounterApp', []);
app.controller('TransactionsController', function ($scope, $http) {
    var url = 'http://localhost:52709/api/Transactions';

    getTransactionList();

    function getTransactionList()
    {
        $http.get(url)
        .success(function (data, status, header, config) {
            $scope.transactionList = data;
            angular.forEach($scope.transactionList, function (transaction, index) {
                $scope.transactionList[index].Amount = '€' + transaction.Amount.toFixed(2);
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
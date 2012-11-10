angular.module('perilus', ['mongolab']).
config(function($routeProvider) {
  $routeProvider.
  when('/', {controller:ListCtrl, templateUrl:'list.html'}).
  // when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
  // when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
  otherwise({redirectTo:'/'});
});
 
 
function ListCtrl($scope, User) {
  $scope.users = User.query();
}
 
 
// function CreateCtrl($scope, $location, User) {
//   $scope.save = function() {
//     User.save($scope.project, function(project) {
//     $ location.path('/edit/' + project._id.$oid);
//   });
//   }
// }
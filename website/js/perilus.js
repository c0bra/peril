angular.module('perilus', ['mongolab']).
config(function($routeProvider) {
  $routeProvider.
  when('/', {controller:ListCtrl, templateUrl:'list.html'}).
  // when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
  // when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
  when('/auth', {controller:AuthCtrl, templateUrl:'auth.html'})
  otherwise({redirectTo:'/auth'});


  // configure html5 to get links working
  // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
  $locationProvider.html5Mode(true);
});
 
 
function ListCtrl($scope, User) {
  $scope.users = User.query();
}

function EditCtrl($scope, User) {

}

// Authentication
function AuthCtrl($scope) {

}
 
// function CreateCtrl($scope, $location, User) {
//   $scope.save = function() {
//     User.save($scope.project, function(project) {
//     $ location.path('/edit/' + project._id.$oid);
//   });
//   }
// }



angular.module('perilus.routeConfig', ['xc.authRouteProvider'])
  .config(['authRouteProvider', '$locationProvider', 'userProfileProvider', function (authRouteProvider, $locationProvider, userProfileProvider) {
    authRouteProvider.
      all().
        when('/', {templateUrl: "/static/templates/home.html"}).
        when('/logout').
        when('/profile', {templateUrl: "/static/templates/currentUser/edit.html"}).
        otherwise({redirectTo: '/'})
    ;


    authRouteProvider.
      only('admin').
        when('/user', {templateUrl: "/static/templates/user/list.html", controller: UserCtrl}).
        when('/user/add', {templateUrl: "/static/templates/user/add.html"}).
        when('/user/edit/:userId', {templateUrl: "/static/templates/user/edit.html"})
    ;
    }
]);

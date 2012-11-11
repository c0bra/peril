var svcurl = 'http://perilus.herokuapp.com';

angular.module('perilus', ['mongolab'])
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {controller:ListCtrl, templateUrl:'/friends'})
  .when('/redirect', { templateUrl:'/redirect' })
  // when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
  // when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
  .when('/auth', {controller:AuthCtrl, templateUrl:'/auth'});
  //.otherwise({redirectTo:'/auth'});


  // configure html5 to get links working
  // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
  //$locationProvider.html5Mode(true);
})
.run( function($rootScope, $location) {
  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if ( $rootScope.loggedUser == null ) {
      // no logged user, we should be going to #login
      if ( next.templateUrl == "/auth" ) {
        // already going to #login, no redirect needed
      } else {
        // not going to #login, we should redirect now
        $location.path( "/auth" );
      }
    }
  });
});
 
 
function ListCtrl($scope, User) {
  $scope.users = User.query();
}

function EditCtrl($scope, User) {

}

// Authentication
function AuthCtrl($scope) {
  // $scope.attemptLogin = function() {
  //   if ( $scope.username == $scope.password ) { // test
  //       $rootScope.loggedUser = $scope.username;
  //       $location.path( "/main" );
  //   } else {
  //       $scope.loginError = "Invalid user/pass.";
  //   }
  // };

  loadSinglyUrl();
}
 
// function CreateCtrl($scope, $location, User) {
//   $scope.save = function() {
//     User.save($scope.project, function(project) {
//     $ location.path('/edit/' + project._id.$oid);
//   });
//   }
// }



// angular.module('perilusServices', ['ngResource']).
//   factory('User', function($resource){
//     return $resource(svcurl + '/user/:id', {}, {
//     query: { method:'GET', params: , isArray:true }
//   });
// });

function loadSinglyUrl(){
  $.get(svcurl + '/singlyurl', function (data) {
    $('#fbbutton').attr('href', data);
  });
}
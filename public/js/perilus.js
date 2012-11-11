//var svcurl = 'http://perilustest.com:7464';
//var svcurl = 'http://localhost:7464';

angular.module('perilus', [])
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/main', { controller:MainCtrl, templateUrl: '/main'})
  .when('/friends', {controller:FriendsCtrl, templateUrl:'/friends'})
  .when('/redirect', { templateUrl:'/redirect' })
  // when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
  // when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
  .when('/auth', {controller:AuthCtrl, templateUrl:'/auth'})
  .otherwise({redirectTo:'/main'});


  // configure html5 to get links working
  // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
  //$locationProvider.html5Mode(true);
})
.run( function($rootScope, $location) {
  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if ( accessToken === null || accessToken === "" ) {
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

function MainCtrl($scope, $http) {
  $http.get('/api/friend_hazards').success(function(data) {
    console.log("WTF??");
    $scope.uhazs = data;
  });
}
 
function FriendsCtrl($scope, $http) {
  // Get the friends
  $http.get('/api/friends').success(function(data) {
    $scope.friends = data;
  });

  $scope.follow = function(friend) {
    $http.post('/api/follow', { id: friend._id }).success(function(){
      friend.following = true;
    });
  }

  $scope.unfollow = function(friend) {
    $http.post('/api/unfollow', { id: friend._id }).success(function(){
      friend.following = false;
    });
  }
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

  
}
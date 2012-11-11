'use strict';
/**
 * A very simple model to represent your authenticated user.
 * The sole requirement for the model is to be able to define
 * a UserProfile::credentials() method, so the router can access
 * the property defining the credentials of the loggedin user.
 * @param data
 * @constructor
 */
function UserProfile (data) {
  var _resource;
  this.populate = function (data) {
    angular.extend(this, data);
  };

  if (data) {
    this.populate(data);
  }
}

/**
 * An example of methods you can add to your model
 * @return {String}
 */
UserProfile.prototype.getFullName = function () {
  return [this.firstName, this.lastName].join(' ');
};


/**
 * The only required method. Here, it returns a String,
 * but it could as well return a complex Object
 * @return {String}
 */
UserProfile.prototype.credentials = function () {
  return this.role;
};


function userProfileProvider () {
  /**
   * Returns a promise of the UserProfile instance to be, for when the $http call is finished
   */
  this.$get = ['profileResource', 'userProfileModel', '$q', function (profileResource, userProfileModel, $q) {
    var deferred = $q.defer();
    profileResource.success(function (data) {
      var resolved = data;
      if (userProfileModel) {
        resolved = new userProfileModel(data);
      }
      return deferred.resolve(resolved);
    });
    return deferred.promise;
  }];
}

angular.module('xc.loggedInUser', [])
  .provider('userProfile', userProfileProvider)
  .constant('userProfileModel', UserProfile)
  .factory('profileResource', ['$http', function ($http) {
    return $http({method: 'GET', url:'/api/profile'})
      .error(function (data, status, headers, config) {
        console.log(data);
      });
}]);

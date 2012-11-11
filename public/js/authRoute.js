authRouteProvider.$inject = ['$routeProvider'];
function authRouteProvider ($routeProvider) {
  /**
   * Creates a controller bound to the route, or wraps the controller in param
   * so the authentication check is run before the original controller is executed
   * @param currentController
   * @return {Function} The wrapper controller
   */
  function redirectCtrlFactory (currentController) {
    _ctrl.$inject = ['currentUser__', 'userRole__', '$location'];
    if (currentController) {
      var currentCtrlDependencies = currentController.$inject || [];
      _ctrl.$inject = currentCtrlDependencies.concat(['currentUser__', 'userRole__', '$location']);
    }
    function _ctrl () {
      var args = Array.prototype.slice.call(arguments);
      var argv = arguments.length;
      if (args[argv - 3].credentials() !== args[argv - 2]) {
        return args[argv - 1].path('/');
      }
      if (currentController) {
        while (args.length !== currentCtrlDependencies.length) {
          args.pop();
        }
        return currentController.apply(this, args);
      }
    }
    return _ctrl;
  }


  var _currentUserRole;

  /**
   * Returns the promise of a userProfile instance
   */
  userProfileResolver.$inject = ['userProfile'];
  function userProfileResolver (userProfile) {
    return userProfile;
  }

  /**
   * New methods available in authRouteProvider
   * @type {Object}
   * @private
   */
  var _ext = {
    /**
     * The routes defined after a call to only(...) will be available only to
     * users with the specified credentials
     * @param role
     * @return {authRouteProvider}
     */
    'only': function (role) {
      _currentUserRole = role;
      return this;
    },
    /**
     * The routes defined after a call to all() will be available to
     * all the users
     * @param role
     * @return {authRouteProvider}
     */
    'all': function () {
      _currentUserRole = null;
      return this;
    },
    /**
     * Wraps the original $routeProvider.when method in order to
     * specify a controller and 2 dependencies, so the authentication
     * check can be done at runtime
     * @param {String} role
     * @return {authRouteProvider}
     */
    'when': function () {
      var conf = arguments[1] || {};
      var _userRole = _currentUserRole;
      conf.resolve = conf.resolve || {};
      if (_userRole) {
        conf.resolve['currentUser__'] =  userProfileResolver;
        conf.resolve['userRole__'] =  function () { return _userRole; };
        conf.controller = redirectCtrlFactory(conf.controller);
      }
      return $routeProvider.when.call(this, arguments[0], conf);
    }
  };
  return angular.extend({}, $routeProvider, _ext);
}

angular.module('xc.authRouteProvider', []).provider('authRoute', authRouteProvider);

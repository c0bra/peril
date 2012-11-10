// This is a module for cloud persistance in mongolab - https://mongolab.com
angular.module('mongolab', ['ngResource']).
    factory('User', function($resource) {
        var User = $resource('https://api.mongolab.com/api/1/databases' +
        '/Perilous/collections/user/:id',
        { apiKey: '2r4wiqjr4kgjwhq21r24' }, {
            update: { method: 'PUT' }
        }
    );
     
    // User.prototype.update = function(cb) {
    //     return User.update({id: this._id.$oid},
    //     angular.extend({}, this, {_id:undefined}), cb);
    // };
     
    // User.prototype.destroy = function(cb) {
    //     return Project.remove({id: this._id.$oid}, cb);
    // };
     
    return User;
});
var React = require('react');
var createReactClass = require('create-react-class');
var ReactFireMixin = require('reactfire');
var ReactBootstrap = require('react-bootstrap');

import ManageUserRow from './manageuserrow.js';

var UserManagement = createReactClass({
    mixins: [ReactFireMixin],

    getInitialState: function () {
        return {
            users: [],
            userPermissions: []
        };
    },

    componentWillMount: function () {
        this.bindAsArray(this.props.model.firebaseRef.child('users'), 'users');
        this.bindAsArray(this.props.model.firebaseRef.child('userGroups').child(this.props.model.groupId).child('users'), 'userPermissions');
    },

    getUserList: function () {
        var lookup = {};
        this.state.userPermissions.forEach(function (elem, idx, arr) {
            lookup[elem['.key']] = elem['.value'];
        });
        var userList = [];
        this.state.users.forEach(function (elem, idx, arr) {
            var hasPermission = false;
            if (elem['.key'])
                hasPermission = lookup[elem['.key']];
            userList.push({ userData: elem, allowed: hasPermission });
        });
        return userList;
    },

    render: function () {
        var _this = this;
        var createItem = function (item, index) {
            return <ReactBootstrap.ListGroupItem key={index}><ManageUserRow model={_this.props.model} userData={item.userData} allowed={item.allowed} /></ReactBootstrap.ListGroupItem>;
        };

        return (
            <div>
                <ReactBootstrap.ListGroup>{this.getUserList().map(createItem)}</ReactBootstrap.ListGroup>
            </div>
        );
    }
});
module.exports = UserManagement;
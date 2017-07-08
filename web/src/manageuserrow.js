var React = require('react');
var ReactFireMixin = require('reactfire');
var ReactBootstrap = require('react-bootstrap');

var ManageUserRow = React.createClass({
    mixins: [ReactFireMixin],

    render: function () {
        return (
            <div className="clearfix">
                <span>{this.props.userData.displayName} ({this.props.userData.authProvider})</span>
                <span className="pull-right">
                    <ReactBootstrap.Button bsStyle={this.props.allowed ? "danger" : "success"}
                        onClick={() => {
                            if (this.props.allowed)
                                this.props.model.removeUserFromGroup(this.props.userData['.key']);
                            else
                                this.props.model.addUserToGroup(this.props.userData['.key']);
                        }}>
                        {this.props.allowed ? "Remove" : "Add"}
                    </ReactBootstrap.Button>
                </span>
            </div>
        );
    }
});
module.exports = ManageUserRow;
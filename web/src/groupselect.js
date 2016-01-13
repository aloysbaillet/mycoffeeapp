import React from 'react';
import ReactFireMixin from 'reactfire';
import {Input, Button, Select} from 'react-bootstrap';

var GroupSelect = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      groupList: [],
      groupNameToAdd: ''
    };
  },

  componentWillMount: function() {
	this.bindAsArray(this.props.model.firebaseRef.child('userGroups').orderByChild('name'), 'groupList');
  },
  
  onGroupSelect: function(event) {
    var groupId = event.target.value;
  	this.props.onGroupSelect(groupId);
  },

  onGroupNameChange: function(e) {
    this.setState({groupNameToAdd: e.target.value})
  },

  onGroupAdd: function(e) {
    var users = {};
    users[this.props.model.uid] = true;
    this.props.model.firebaseRef.child('userGroups').push({
      name: this.state.groupNameToAdd,
      users: users
    });
  },

  render: function() {
    var _this = this;
    function createGroupOption(item, index){
      return <option key={index} value={item['.key']}>{item.name}</option>
    }
    var groupList = [];
    for(var gid in this.state.groupList){
      var group = this.state.groupList[gid];
      groupList.push({value: group['.key'], label: group.name});
    }
    return <div>
      <div className="input-group pull-left col-xs-5">
        <select value={this.props.model.groupId || ""} className="form-control" onChange={this.onGroupSelect}>
          {this.state.groupList.map(createGroupOption)}
        </select>
      </div>
      <div className="input-group pull-right col-xs-4 input-sm">
        <Input type="text" placeholder="New Group" value={this.state.groupNameToAdd} onChange={this.onGroupNameChange}/>
        <span className="input-group-btn">
          <Button disabled={!this.state.groupNameToAdd} onClick={this.onGroupAdd}>Add</Button>
        </span>
      </div>
    </div>;
  }
});
module.exports = GroupSelect;


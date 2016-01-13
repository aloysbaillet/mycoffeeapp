import React from 'react';
import ReactFireMixin from 'reactfire';
import Select from 'react-select';
import {Input, Button} from 'react-bootstrap';

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
  
  onGroupSelect: function(option) {
    var groupId = option.value;
  	this.props.onGroupSelect(null);
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
    function createGroupItem(item, index){
      return <li key={index} onClick={_this.onGroupSelect.bind(null, item['.key'])}><a href="#">{item.name}</a></li>
    }
    var groupList = [];
    for(var gid in this.state.groupList){
      var group = this.state.groupList[gid];
      groupList.push({value: group['.key'], label: group.name});
    }
    return <div>
      <div className="input-group pull-left col-xs-5">
        <Select
          name="groupSelect"
          value={this.props.model.groupId}
          options={groupList}
          placeholder="Select a Group"
          onChange={this.onGroupSelect}
          />
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


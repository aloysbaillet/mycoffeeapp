var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var Select = require('react-select');
var C = require('./constants.js');

var CoffeeOrder = React.createClass({

  getInitialState: function() {
    return {
      coffeeType:'',
      coffeeTypeOptions: [],
      sugar:0,
      sugarOptions: [],
      milk:'',
      milkOptions: [],
      uid:'',
      userDisplayName:'',
      userList:[]
    };
  },

  componentWillMount: function() {
    var coffeeDataRef = this.props.model.firebaseRef.child('coffeeData');
    coffeeDataRef.child('coffeeTypeList').on('value', this.onCoffeeTypeListValue);
    coffeeDataRef.child('sugarTypeList').on('value', this.onSugarListValue);
    coffeeDataRef.child('milkTypeList').on('value', this.onMilkListValue);
    this.props.model.firebaseRef.child('users').on('value', this.onUserListValue);
    this.setUser(this.props.model.uid, this.props.model.userDisplayName);
  },

  componentWillUnMount: function() {
    var coffeeDataRef = this.props.model.firebaseRef.child('coffeeData');
    coffeeDataRef.child('coffeeTypeList').off('value');
    coffeeDataRef.child('sugarTypeList').off('value');
    coffeeDataRef.child('milkTypeList').off('value');
    this.props.model.firebaseRef.child('users').off();
  },

  onCoffeeTypeListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var coffeeType = value[i];
      options.push({ label: coffeeType.name,
                     value: coffeeType.shortName });
    }
    this.setState({coffeeTypeOptions: options});
  },

  onCoffeeTypeChange: function(value){
    var coffeeType = '';
    if(value)
      coffeeType = value.value;
    this.setState({coffeeType: coffeeType})
    this.props.model.firebaseRef.child('users').child(this.state.uid).update({preferredCoffeeType: coffeeType})
  },

  onSugarListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var sugar = value[i];
      options.push({ label: sugar.name,
                     value: sugar.quantity });
    }
    this.setState({sugarOptions: options});
  },

  onSugarChange: function(value){
    var sugar = 0;
    if(value)
      sugar = value.value;
    this.setState({sugar: sugar})
    this.props.model.firebaseRef.child('users').child(this.state.uid).update({preferredSugar: sugar})
  },

  onMilkListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var milk = value[i];
      options.push({ label: milk.name,
                     value: milk.name });
    }
    this.setState({milkOptions: options});
  },

  onMilkChange: function(value){
    var milk = '';
    if(value)
      milk = value.value;
    this.setState({milk: milk});
    this.props.model.firebaseRef.child('users').child(this.state.uid).update({preferredMilk: milk})
  },

  onUserListValue: function(snapshot) {
    var users = [];
    var userList = snapshot.val();
    var options = [];
    for(i in userList){
      options.push({ label: userList[i].displayName,
                     value: i });
    }
    this.setState({userList: options});
  },

  setUser: function(uid, userDisplayName){
    this.setState({uid: uid,
                   userDisplayName: userDisplayName});
    var _this = this;
    this.props.model.firebaseRef.child('users').child(uid).once('value', function(snapshot){
      var u = snapshot.val();
      _this.setState({coffeeType: u.preferredCoffeeType ? u.preferredCoffeeType : '',
                      sugar: u.preferredSugar ? u.preferredSugar : 0,
                      milk: u.preferredMilk ? u.preferredMilk: ''});
    });
  },

  onUserChange: function(value){
    if(value){
      this.setUser(value.value, value.label);
    }
    else
      this.setState({uid: '',
                     userDisplayName: ''});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if(this.state.coffeeType == '')
      return;
    var uid = this.state.uid;
    var userDisplayName = this.state.userDisplayName;
    if(!uid){
      uid = this.props.model.uid;
      userDisplayName = this.props.model.userDisplayName;
    }
    this.props.model.createOrder(this.state.coffeeType,
                                 this.state.sugar,
                                 this.state.milk,
                                 uid,
                                 userDisplayName);
  },

  render: function() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <Select
            name="userSelect"
            value={this.state.uid}
            options={this.state.userList}
            placeholder="Select User - Defaults to Me"
            onChange={this.onUserChange}
        />
        <Select
            name="milkSelect"
            value={this.state.milk}
            options={this.state.milkOptions}
            placeholder="Select Milk"
            onChange={this.onMilkChange}
        />
        <Select
            name="coffeeTypeSelect"
            value={this.state.coffeeType}
            options={this.state.coffeeTypeOptions}
            placeholder="Select Coffee Type"
            onChange={this.onCoffeeTypeChange}
        />
        <Select
            name="sugarSelect"
            value={this.state.sugar}
            options={this.state.sugarOptions}
            placeholder="Select Sugar"
            onChange={this.onSugarChange}
        />
        <button>Order</button>
      </form>
    );
  }
});

module.exports = CoffeeOrder;

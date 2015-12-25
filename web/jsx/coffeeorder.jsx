var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var Select = require('react-select');
var C = require('./constants.js');

var CoffeeOrder = React.createClass({

  getInitialState: function() {
    return {
      coffeeType:"",
      coffeeTypeOptions: [],
      sugar:"",
      sugarOptions: [],
      milk:"",
      milkOptions: []
    };
  },

  componentWillMount: function() {
    var coffeeDataRef = this.props.model.firebaseRef.child('coffeeData');
    coffeeDataRef.child("coffeeTypeList").on("value", this.onCoffeeTypeListValue);
    coffeeDataRef.child("sugarTypeList").on("value", this.onSugarListValue);
    coffeeDataRef.child("milkTypeList").on("value", this.onMilkListValue);
  },

  componentWillUnMount: function() {
    var coffeeDataRef = this.props.model.firebaseRef.child('coffeeData');
    coffeeDataRef.child("coffeeTypeList").off("value");
    coffeeDataRef.child("sugarTypeList").off("value");
    coffeeDataRef.child("milkTypeList").off("value");
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
    this.setState({coffeeType: value.value})
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
    this.setState({sugar: value.value})
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
    if(value)
      this.setState({milk: value.value});
    else
      this.setState({milk: ''});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if(this.state.coffeeType == "")
      return;
    this.props.model.createOrder(this.state.coffeeType,
                                 this.state.sugar,
                                 this.state.milk,
                                 this.props.model.uid,
                                 this.props.model.userDisplayName);
  },

  render: function() {
    return (
      <form onSubmit={ this.handleSubmit }>
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

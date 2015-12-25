jest.dontMock('../jsx/constants.js');
jest.dontMock('../jsx/pendingorderlist.jsx');
jest.dontMock('../jsx/coffeeorder.jsx');

var proxyquire   = require('proxyquire');
var proxyquire   = require('proxyquire');
var MockFirebase = require('mockfirebase').MockFirebase;
var mock;
var mySrc = proxyquire('firebase', {
  firebase: function (url) {
    return (mock = new MockFirebase(url));
  },
  '@global': true
});
mock.flush();

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Firebase = require('firebase');

var C = require('../jsx/constants.js');
C.BASE_FIREBASE_URL = C.BASE_FIREBASE_URL_TEST_NODE;

var PendingOrderList = require('../jsx/pendingorderlist.jsx');
var CoffeeOrder = require('../jsx/coffeeorder.jsx');

describe('PendingOrderList', () => {

  it('uses the Node Test URL', () => {
    expect(C.BASE_FIREBASE_URL).toEqual(C.BASE_FIREBASE_URL_TEST_NODE);
  });

  it('has 0 pending orders initially', () => {
    var l = TestUtils.renderIntoDocument(
      <PendingOrderList uid={1} />
    );

    var pendingOrderListNode = ReactDOM.findDOMNode(l);

    var nodelist = pendingOrderListNode.getElementsByTagName("li");
    expect(nodelist.length).toEqual(0);
  });

  it('has 1 pending order after calling createOrder', () => {
    var coffeeOrder = TestUtils.renderIntoDocument(
      <CoffeeOrder uid={1} />
    );
    MockFirebase.override();
    coffeeOrder.createOrder('cap', 1, '', 'test1');

    var orderList = TestUtils.renderIntoDocument(
      <PendingOrderList uid={1} />
    );
    var pendingOrderListNode = ReactDOM.findDOMNode(orderList);

    var nodelist = pendingOrderListNode.getElementsByTagName("li");
    expect(nodelist.length).toEqual(1);
  });

});

var React = require('react');
var ReactFireMixin = require('reactfire');
var TimeAgo = require('react-timeago');
var ReactBootstrap = require('react-bootstrap');

var ChatMessages = React.createClass({
    render() {
        return <ReactBootstrap.ListGroup>{this.renderMessages()}</ReactBootstrap.ListGroup>;
    },

    renderMessages() {
        return this.props.messages.map(function (message) {
            return <ReactBootstrap.ListGroupItem key={message['.key']}>
                <strong>{message.userDisplayName} (<TimeAgo date={message.timestamp} />)</strong>:
                {message.text}
            </ReactBootstrap.ListGroupItem>;
        });
    }
});

var ChatInput = React.createClass({
  sendMessage(e) {
    e.preventDefault();
    var message = this.refs.input.getValue();
    this.props.model.newChatMessage(message);
    this.refs.input.value = '';
  },

  render() {
    return <form onSubmit={this.sendMessage}>
        <div className="input-group">
          <ReactBootstrap.Input type="text" placeholder="Chat a bit..." ref="input"/>
          <span className="input-group-btn">
            <ReactBootstrap.Button onClick={this.sendMessage}>Post</ReactBootstrap.Button>
          </span>
        </div>
    </form>;
  }
});

var ChatBox = React.createClass({
  mixins: [ReactFireMixin],

  componentWillMount() {
    this.bindAsArray(this.props.model.groupRef.child('messages').limitToLast(100), 'messages');
  },

  getInitialState() {
    return {
      messages: []
    };
  },

  render() {
    return <div className="">
      <ChatMessages messages={this.state.messages} />
      <ChatInput model={this.props.model} />
    </div>;
  }
});
module.exports = ChatBox;

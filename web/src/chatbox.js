var React = require('react');
var createReactClass = require('create-react-class');
var ReactFireMixin = require('reactfire');
var TimeAgo = require('react-timeago').default;
var ReactBootstrap = require('react-bootstrap');

var ChatMessages = createReactClass({
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

var ChatInput = createReactClass({
  sendMessage(e) {
    e.preventDefault();
    var message = this.refs.input.getValue();
    this.props.model.newChatMessage(message);
    this.refs.input.value = '';
  },

  render() {
    return <form onSubmit={this.sendMessage}>
        <div className="input-group">
          <ReactBootstrap.FormControl type="text" placeholder="Chat a bit..." ref="input"/>
          <span className="input-group-btn">
            <ReactBootstrap.Button onClick={this.sendMessage}>Post</ReactBootstrap.Button>
          </span>
        </div>
    </form>;
  }
});

var ChatBox = createReactClass({
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

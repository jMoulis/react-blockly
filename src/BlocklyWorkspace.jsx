import React from 'react';
import ReactDOM from 'react-dom';

var BlocklyWorkspace = React.createClass({
  getInitialState: function() {
    return {
      workspace: null,
      xml: this.props.xml
    };
  },

  componentDidMount: function() {
    // TODO figure out how to use setState here without breaking the toolbox when switching tabs
    this.state.workspace = Blockly.inject(
      this.refs.editorDiv,
      _.extend(_.clone(this.props.workspaceConfiguration || {}), {
        toolbox: ReactDOM.findDOMNode(this.refs.dummyToolbox)
      })
    );

    if (this.state.xml) {
      this.importFromXml(this.state.xml);
    }

    this.state.workspace.addChangeListener(_.debounce(function() {
      var newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.state.workspace));
      if (newXml == this.state.xml) {
        return;
      }

      this.setState({xml: newXml}, function() {
        if (this.props.xmlDidChange) {
          this.props.xmlDidChange(this.state.xml);
        }
      }.bind(this));
    }.bind(this), 200));
  },

  importFromXml: function(xml) {
    Blockly.Xml.domToWorkspace(this.state.workspace, Blockly.Xml.textToDom(xml));
  },

  componentWillReceiveProps: function(newProps) {
    if (this.props.xml != newProps.xml) {
      this.setState({xml: newProps.xml});
    }
  },

  componentWillUnmount: function() {
    if (this.state.workspace) {
      this.state.workspace.dispose();
    }
  },

  shouldComponentUpdate: function() {
    return false;
  },

  toolboxDidUpdate: function(toolboxNode) {
    if (toolboxNode && this.state.workspace) {
      this.state.workspace.updateToolbox(toolboxNode);
    }
  },

  render: function() {
    // We have to fool Blockly into setting up a toolbox with categories initially;
    // otherwise it will refuse to do so after we inject the real categories into it.

    return (
      <div className={this.props.className}>
        <xml style={{display: "none"}} ref="dummyToolbox">
          <category name="Dummy toolbox">
          </category>
        </xml>
        <div ref="editorDiv" className={this.props.className} />
      </div>
    );
  }
});

export default BlocklyWorkspace;
/**
  * <HeaderBar />
  */

import React from 'react';
import Grip from '../multi-column/grip';

export default class HeaderBar extends React.Component {
  render() {
    return (
      <div className="flex justify-between items-center py-2">
        <div className="bg-black bg-opacity-25 rounded-md py-1 px-1.5 text-xs font-medium text-white">{this.props.data.text}</div>
        {/*<span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{this.props.data.text}</span>*/}
        <div className="flex space-x-2 hover:text-gray-500 text-gray-100">
          { this.props.data.element !== 'LineBreak' &&
            <div className="btn is-isolated" onClick={this.props.editModeOn.bind(this.props.parent, this.props.data)}><i className="is-isolated fas fa-edit"></i></div>
          }
          <div className="btn is-isolated" onClick={this.props.onDestroy.bind(this, this.props.data)}><i className="is-isolated fas fa-trash"></i></div>
          { !this.props.data.isContainer &&
            <Grip data={this.props.data} index={this.props.index} onDestroy={this.props.onDestroy} setAsChild={this.props.setAsChild} />
          }
        </div>
      </div>
    );
  }
}

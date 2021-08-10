/**
  * <ReactFormBuilder />
*/

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Preview from './preview';
import Toolbar from './toolbar';
import ReactFormGenerator from './form';
import store from './stores/store';
import Registry from './stores/registry';

class ReactFormBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editElement: null,
      hideToolbar: false,
    };
    this.editModeOn = this.editModeOn.bind(this);
  }

  editModeOn(data, e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.editMode) {
      this.setState({ editMode: !this.state.editMode, editElement: null });
    } else {
      this.setState({ editMode: !this.state.editMode, editElement: data });
    }
  }

  manualEditModeOff() {
    if (this.state.editMode) {
      this.setState({
        editMode: false,
        editElement: null,
      });
    }
  }

  render() {
    const toolbarProps = {
      showDescription: this.props.show_description,
    };
    if (this.props.toolbarItems) { toolbarProps.items = this.props.toolbarItems; }
    return (
      <DndProvider backend={HTML5Backend}>
       <div>
          <div className="react-form-builder clearfix">
            <div className="flex justify-between border border-gray-100 rounded-md">
              <div className="w-full bg-gray-50">
                <div className="bg-white p-3 border-b border-gray-100 text-md text-gray-800 font-medium">Editor</div>
                <Preview
                  className="p-3"
                  hideToolbar={(hide = true) => this.setState({ hideToolbar: hide })}
                  files={this.props.files}
                  manualEditModeOff={this.manualEditModeOff.bind(this)}
                  showCorrectColumn={this.props.showCorrectColumn}
                  parent={this}
                  data={this.props.data}
                  url={this.props.url}
                  saveUrl={this.props.saveUrl}
                  onLoad={this.props.onLoad}
                  onPost={this.props.onPost}
                  editModeOn={this.editModeOn}
                  editMode={this.state.editMode}
                  variables={this.props.variables}
                  registry={Registry}
                  editElement={this.state.editElement}
                  renderEditForm={this.props.renderEditForm}
                />
              </div>
              { !this.state.editElement && (
                <div className="w-1/4 flex-shrink-1 border-l border-gray-100">
                  <div className="p-3 pl-0 border-b border-gray-100 text-md text-gray-800 font-medium">Fields</div>
                  <div className="w-full p-3">
                    <Toolbar {...toolbarProps} customItems={this.props.customToolbarItems} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DndProvider>
    );
  }
}

const FormBuilders = {};
FormBuilders.ReactFormBuilder = ReactFormBuilder;
FormBuilders.ReactFormGenerator = ReactFormGenerator;
FormBuilders.ElementStore = store;
FormBuilders.Registry = Registry;

export default FormBuilders;

export {
 ReactFormBuilder, ReactFormGenerator, store as ElementStore, Registry,
};

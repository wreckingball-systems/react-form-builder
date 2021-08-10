import React, {Fragment} from 'react';
import { Listbox, Transition } from '@headlessui/react'
import TextAreaAutosize from 'react-textarea-autosize';
import {
  ContentState, EditorState, convertFromHTML, convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';

import DynamicOptionList from './dynamic-option-list';
import { get } from './stores/requests';
import ID from './UUID';

const toolbar = {
  options: ['inline', 'list', 'textAlign', 'fontSize', 'link', 'history'],
  inline: {
    inDropdown: false,
    className: undefined,
    options: ['bold', 'italic', 'underline', 'superscript', 'subscript'],
  },
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false,
      selected: {},
    };
  }

  toggleRequired() {
    // const this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const this_element = this.state.element;
    this_element[elemProperty] = e.target[targProperty];

    this.setState({
      element: this_element,
      dirty: true,
    }, () => {
      if (targProperty === 'checked') { this.updateElement(); }
    });
  }

  onEditorStateChange(index, property, editorContent) {
    // const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/&nbsp;/g, ' ')
      .replace(/(?:\r\n|\r|\n)/g, ' ');
    const this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  }

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks || !newContent.contentBlocks.length) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentState = ContentState.createFromBlockArray(newContent);
    return EditorState.createWithContent(contentState);
  }

  addOptions() {
    const optionsApiUrl = document.getElementById('optionsApiUrl').value;
    if (optionsApiUrl) {
      get(optionsApiUrl).then(data => {
        this.props.element.options = [];
        const { options } = this.props.element;
        data.forEach(x => {
          // eslint-disable-next-line no-param-reassign
          x.key = ID.uuid();
          options.push(x);
        });
        const this_element = this.state.element;
        this.setState({
          element: this_element,
          dirty: true,
        });
      });
    }
  }

  render() {
    if (this.state.dirty) {
      this.props.element.dirty = true;
    }

    const this_checked = this.props.element.hasOwnProperty('required') ? this.props.element.required : false;
    const this_read_only = this.props.element.hasOwnProperty('readOnly') ? this.props.element.readOnly : false;
    const this_default_today = this.props.element.hasOwnProperty('defaultToday') ? this.props.element.defaultToday : false;
    const this_show_time_select = this.props.element.hasOwnProperty('showTimeSelect') ? this.props.element.showTimeSelect : false;
    const this_show_time_select_only = this.props.element.hasOwnProperty('showTimeSelectOnly') ? this.props.element.showTimeSelectOnly : false;
    const this_checked_inline = this.props.element.hasOwnProperty('inline') ? this.props.element.inline : false;
    const this_checked_bold = this.props.element.hasOwnProperty('bold') ? this.props.element.bold : false;
    const this_checked_italic = this.props.element.hasOwnProperty('italic') ? this.props.element.italic : false;
    const this_checked_center = this.props.element.hasOwnProperty('center') ? this.props.element.center : false;
    const this_checked_page_break = this.props.element.hasOwnProperty('pageBreakBefore') ? this.props.element.pageBreakBefore : false;
    const this_checked_alternate_form = this.props.element.hasOwnProperty('alternateForm') ? this.props.element.alternateForm : false;

    const {
      canHavePageBreakBefore, canHaveAlternateForm, canHaveDisplayHorizontal, canHaveOptionCorrect, canHaveOptionValue,
    } = this.props.element;

    const this_files = this.props.files.length ? this.props.files : [];
    if (this_files.length < 1 || (this_files.length > 0 && this_files[0].id !== '')) {
      this_files.unshift({ id: '', file_name: '' });
    }

    let editorState;
    if (this.props.element.hasOwnProperty('content')) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty('label')) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    console.log({selected: this.stateselected})

    return (
      <div>
        <div className="clearfix">
          <h4 className="float-left">{this.props.element.text}</h4>
          <i className="float-right fas fa-times dismiss-edit" onClick={this.props.manualEditModeOff}></i>
        </div>
        { this.props.element.hasOwnProperty('content') &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light">Text to display:</label>

            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'content')}
              stripPastedStyles={true} />
          </div>
        }
        { this.props.element.hasOwnProperty('file_path') &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light" htmlFor="fileSelect">Choose file:</label>
            <Listbox value={this.state.selected} onChange={(item) => this.setState({ selected: item })}>
              {({ open }) => (
                <>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <span className="flex items-center">
                        <img src={`http://localhost:5000${this.state.selected.source}`} alt="" className="flex-shrink-0 h-6 w-6 rounded-full object-contain" />
                        <span className="ml-3 block truncate">{this.state.selected.name}</span>
                      </span>
                      <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {/*<SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />*/}
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options
                        static
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      >
                        {this_files.map((file) => (
                          <Listbox.Option
                            key={file.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                'cursor-default select-none relative py-2 pl-3 pr-9'
                              )
                            }
                            value={file}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  <img src={`http://localhost:5000${file.source}`} alt="" className="object-contain flex-shrink-0 h-6 w-6 rounded-full" />
                                  <span
                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {file.file_name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4'
                                    )}
                                  >
                                  {/*<CheckIcon className="h-5 w-5" aria-hidden="true" />*/}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>
            <select value={this.state.selected.id} id="fileSelect" className="hidden" defaultValue={this.props.element.file_path} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'file_path', 'value')}>
              {this_files.map((file) => {
                const this_key = `file_${file.id}`;
                return <option value={file.id} key={this_key}>{file.file_name}</option>;
              })}
            </select>
          </div>
        }
        { this.props.element.hasOwnProperty('href') &&
          <div className="form-group">
            <TextAreaAutosize type="text" className="form-control" defaultValue={this.props.element.href} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'href', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('src') &&
          <div>
            <div className="form-group">
              <label className="text-lg text-gray-500 font-light" htmlFor="srcInput">Link to:</label>
              <input id="srcInput" type="text" className="form-control" defaultValue={this.props.element.src} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'src', 'value')} />
            </div>
            <div className="form-group">
              <div className="custom-control custom-checkbox">
                <input id="do-center" className="custom-control-input" type="checkbox" checked={this_checked_center} value={true} onChange={this.editElementProp.bind(this, 'center', 'checked')} />
                <label className="custom-control-label" htmlFor="do-center">
                  Center?
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3">
                <label className="text-lg text-gray-500 font-light" htmlFor="elementWidth">Width:</label>
                <input id="elementWidth" type="text" className="form-control" defaultValue={this.props.element.width} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'width', 'value')} />
              </div>
              <div className="col-sm-3">
                <label className="text-lg text-gray-500 font-light" htmlFor="elementHeight">Height:</label>
                <input id="elementHeight" type="text" className="form-control" defaultValue={this.props.element.height} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'height', 'value')} />
              </div>
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('label') &&
          <div className="form-group">
            <label>Display Label</label>
            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'label')}
              stripPastedStyles={true} />
            <br />
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="is-required"
                  name="is-required"
                  type="checkbox"
                  checked={this_checked}
                  value={true} onChange={this.editElementProp.bind(this, 'required', 'checked')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is-required" className="font-medium text-gray-700">
                  Required?
                </label>
                <p id="comments-description" className="text-gray-500">
                  Force the user to complete this field.
                </p>
              </div>
            </div>
            { this.props.element.hasOwnProperty('readOnly') &&
              <div className="custom-control custom-checkbox">
                <input
                  id="is-read-only"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  type="checkbox"
                  checked={this_read_only}
                  value={true}
                  onChange={this.editElementProp.bind(this, 'readOnly', 'checked')}
                />
                <div className="ml-3 text-sm">
                  <label htmlFor="is-required" className="font-medium text-gray-700">
                    Read only
                  </label>
                  <p id="comments-description" className="text-gray-500">
                    Force the user to complete this field.
                  </p>
                </div>
              </div>
            }
            { this.props.element.hasOwnProperty('defaultToday') &&
              <div className="custom-control custom-checkbox">
                <input id="is-default-to-today" className="custom-control-input" type="checkbox" checked={this_default_today} value={true} onChange={this.editElementProp.bind(this, 'defaultToday', 'checked')} />
                <label className="custom-control-label" htmlFor="is-default-to-today">
                  Default to Today?
                </label>
              </div>
            }
            { this.props.element.hasOwnProperty('showTimeSelect') &&
              <div className="custom-control custom-checkbox">
                <input id="show-time-select" className="custom-control-input" type="checkbox" checked={this_show_time_select} value={true} onChange={this.editElementProp.bind(this, 'showTimeSelect', 'checked')} />
                <label className="custom-control-label" htmlFor="show-time-select">
                  Show Time Select?
                </label>
              </div>
            }
            { this_show_time_select && this.props.element.hasOwnProperty('showTimeSelectOnly') &&
              <div className="custom-control custom-checkbox">
                <input id="show-time-select-only" className="custom-control-input" type="checkbox" checked={this_show_time_select_only} value={true} onChange={this.editElementProp.bind(this, 'showTimeSelectOnly', 'checked')} />
                <label className="custom-control-label" htmlFor="show-time-select-only">
                  Show Time Select Only?
                </label>
              </div>
            }
            { (this.state.element.element === 'RadioButtons' || this.state.element.element === 'Checkboxes') && canHaveDisplayHorizontal &&
              <div className="custom-control custom-checkbox">
                <input id="display-horizontal" className="custom-control-input" type="checkbox" checked={this_checked_inline} value={true} onChange={this.editElementProp.bind(this, 'inline', 'checked')} />
                <label className="custom-control-label" htmlFor="display-horizontal">
                  Display horizontal
                </label>
              </div>
            }
          </div>
        }

        {this.state.element.element === 'Signature' && this.props.element.readOnly
          ? (
            <div className="form-group">
              <label className="text-lg text-gray-500 font-light" htmlFor="variableKey">Variable Key:</label>
              <input id="variableKey" type="text" className="form-control" defaultValue={this.props.element.variableKey} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'variableKey', 'value')} />
              <p className="help-block">This will give the element a key that can be used to replace the content with a runtime value.</p>
            </div>
          )
          : (<div/>)
        }

        {canHavePageBreakBefore &&
          <div className="hidden">
            <label className="text-lg text-gray-500 font-light">Print Options</label>
            <div className="custom-control custom-checkbox">
              <input id="page-break-before-element" className="custom-control-input" type="checkbox" checked={this_checked_page_break} value={true} onChange={this.editElementProp.bind(this, 'pageBreakBefore', 'checked')} />
              <label className="custom-control-label" htmlFor="page-break-before-element">
                Page Break Before Element?
              </label>
            </div>
          </div>
        }

        {canHaveAlternateForm &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light">Alternate/Signature Page</label>
            <div className="custom-control custom-checkbox">
              <input id="display-on-alternate" className="custom-control-input" type="checkbox" checked={this_checked_alternate_form} value={true} onChange={this.editElementProp.bind(this, 'alternateForm', 'checked')} />
              <label className="custom-control-label" htmlFor="display-on-alternate">
                Display on alternate/signature Page?
              </label>
            </div>
          </div>
        }

        { this.props.element.hasOwnProperty('step') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="text-lg text-gray-500 font-light" htmlFor="rangeStep">Step</label>
              <input id="rangeStep" type="number" className="form-control" defaultValue={this.props.element.step} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'step', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('min_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="text-lg text-gray-500 font-light" htmlFor="rangeMin">Min</label>
              <input id="rangeMin" type="number" className="form-control" defaultValue={this.props.element.min_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'min_value', 'value')} />
              <input type="text" className="form-control" defaultValue={this.props.element.min_label} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'min_label', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('max_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="text-lg text-gray-500 font-light" htmlFor="rangeMax">Max</label>
              <input id="rangeMax" type="number" className="form-control" defaultValue={this.props.element.max_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'max_value', 'value')} />
              <input type="text" className="form-control" defaultValue={this.props.element.max_label} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'max_label', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('default_value') &&
          <div className="form-group">
            <div className="form-group-range">
              <label className="text-lg text-gray-500 font-light" htmlFor="defaultSelected">Default Selected</label>
              <input id="defaultSelected" type="number" className="form-control" defaultValue={this.props.element.default_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'default_value', 'value')} />
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('static') && this.props.element.static &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light">Text Style</label>
            <div className="custom-control custom-checkbox">
              <input id="do-bold" className="custom-control-input" type="checkbox" checked={this_checked_bold} value={true} onChange={this.editElementProp.bind(this, 'bold', 'checked')} />
              <label className="custom-control-label" htmlFor="do-bold">
                Bold
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input id="do-italic" className="custom-control-input" type="checkbox" checked={this_checked_italic} value={true} onChange={this.editElementProp.bind(this, 'italic', 'checked')} />
              <label className="custom-control-label" htmlFor="do-italic">
                Italic
              </label>
            </div>
          </div>
        }
        { this.props.element.showDescription &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light" htmlFor="questionDescription">Description</label>
            <TextAreaAutosize type="text" className="form-control" id="questionDescription" defaultValue={this.props.element.description} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'description', 'value')} />
          </div>
        }
        { this.props.showCorrectColumn && this.props.element.canHaveAnswer && !this.props.element.hasOwnProperty('options') &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light" htmlFor="correctAnswer">Correct Answer</label>
            <input id="correctAnswer" type="text" className="form-control" defaultValue={this.props.element.correct} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'correct', 'value')} />
          </div>
        }
        { this.props.element.canPopulateFromApi && this.props.element.hasOwnProperty('options') &&
          <div className="form-group">
            <label className="text-lg text-gray-500 font-light" htmlFor="optionsApiUrl">Populate Options from API</label>
            <div className="row">
              <div className="col-sm-6">
                <input className="form-control" style={{ width: '100%' }} type="text" id="optionsApiUrl" placeholder="http://localhost:8080/api/optionsdata" />
              </div>
              <div className="col-sm-6">
                <button onClick={this.addOptions.bind(this)} className="btn btn-success">Populate</button>
              </div>
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('options') &&
          <DynamicOptionList showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length} />
        }
      </div>
    );
  }
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };

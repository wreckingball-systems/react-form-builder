/**
  * <Form />
  */

import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'fbemitter';
import FormValidator from './form-validator';
import FormElements from './form-elements';
import { TwoColumnRow, ThreeColumnRow, FourColumnRow } from './multi-column';
import CustomElement from './form-elements/custom-element';
import Registry from './stores/registry';
import { flatten, parsePages } from './functions';

const {
  Image, Checkboxes, Signature, Download, Camera,
} = FormElements;

export default class ReactForm extends React.Component {
  form;

  inputs = {};

  answerData;

  constructor(props) {
    super(props);

    this.state = {
      pageNumber: 1,
    };
    const parsedData = parsePages(props.data);
    this.state.parsedData = parsedData; // flatten(parsedData);
    console.log(this.state.parsedData);
    this.answerData = this._convert(props.answer_data);
    this.emitter = new EventEmitter();
    this.getDataById = this.getDataById.bind(this);
  }

  _convert(answers) {
    if (Array.isArray(answers)) {
      const result = {};
      answers.forEach(x => {
        if (x.name.indexOf('tags_') > -1) {
          result[x.name] = x.value.map(y => y.value);
        } else {
          result[x.name] = x.value;
        }
      });
      return result;
    }
    return answers || {};
  }

  _getDefaultValue(item) {
    return this.answerData[item.field_name];
  }

  _optionsDefaultValue(item) {
    const defaultValue = this._getDefaultValue(item);
    if (defaultValue) {
      return defaultValue;
    }

    const defaultChecked = [];
    item.options.forEach(option => {
      if (this.answerData[`option_${option.key}`]) {
        defaultChecked.push(option.key);
      }
    });
    return defaultChecked;
  }

  _getItemValue(item, ref) {
    let $item = {
      element: item.element,
      value: '',
    };
    if (item.element === 'Rating') {
      $item.value = ref.inputField.current.state.rating;
    } else if (item.element === 'Tags') {
      $item.value = ref.inputField.current.state.value;
    } else if (item.element === 'DatePicker') {
      $item.value = ref.state.value;
    } else if (item.element === 'Camera') {
      $item.value = ref.state.img ? ref.state.img.replace('data:image/png;base64,', '') : '';
    } else if (ref && ref.inputField && ref.inputField.current) {
      $item = ReactDOM.findDOMNode(ref.inputField.current);
      if ($item && typeof $item.value === 'string') {
        $item.value = $item.value.trim();
      }
    }
    return $item;
  }

  _isIncorrect(item) {
    let incorrect = false;
    if (item.canHaveAnswer) {
      const ref = this.inputs[item.field_name];
      if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
        item.options.forEach(option => {
          const $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
          if ((option.hasOwnProperty('correct') && !$option.checked) || (!option.hasOwnProperty('correct') && $option.checked)) {
            incorrect = true;
          }
        });
      } else {
        const $item = this._getItemValue(item, ref);
        if (item.element === 'Rating') {
          if ($item.value.toString() !== item.correct) {
            incorrect = true;
          }
        } else if ($item.value.toLowerCase() !== item.correct.trim().toLowerCase()) {
          incorrect = true;
        }
      }
    }
    return incorrect;
  }

  _isInvalid(item) {
    let invalid = false;
    if (item.required === true) {
      const ref = this.inputs[item.field_name];
      if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
        let checked_options = 0;
        item.options.forEach(option => {
          const $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
          if ($option.checked) {
            checked_options += 1;
          }
        });
        if (checked_options < 1) {
          // errors.push(item.label + ' is required!');
          invalid = true;
        }
      } else {
        const $item = this._getItemValue(item, ref);
        if (item.element === 'Rating') {
          if ($item.value === 0) {
            invalid = true;
          }
        } else if ($item.value === undefined || $item.value.length < 1) {
          invalid = true;
        }
      }
    }
    return invalid;
  }

  _collect(item) {
    const itemData = {
      name: item.field_name,
      custom_name: item.custom_name || item.field_name,
    };
    const ref = this.inputs[item.field_name];
    if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
      const checked_options = [];
      item.options.forEach(option => {
        const $option = ReactDOM.findDOMNode(ref.options[`child_ref_${option.key}`]);
        if ($option.checked) {
          checked_options.push(option.key);
        }
      });
      itemData.value = checked_options;
    } else {
      if (!ref) return null;
      itemData.value = this._getItemValue(item, ref).value;
    }
    return itemData;
  }

  _collectFormData(data) {
    const formData = [];
    data.forEach(item => {
      const item_data = this._collect(item);
      if (item_data) {
        formData.push(item_data);
      }
    });
    return formData;
  }

  _getSignatureImg(item) {
    const ref = this.inputs[item.field_name];
    const $canvas_sig = ref.canvas.current;
    if ($canvas_sig) {
      const base64 = $canvas_sig.toDataURL().replace('data:image/png;base64,', '');
      const isEmpty = $canvas_sig.isEmpty();
      const $input_sig = ReactDOM.findDOMNode(ref.inputField.current);
      if (isEmpty) {
        $input_sig.value = '';
      } else {
        $input_sig.value = base64;
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    let errors = [];
    if (!this.props.skip_validations) {
      errors = this.validateForm();
      // Publish errors, if any.
      this.emitter.emit('formValidation', errors);
    }

    // Only submit if there are no errors.
    if (errors.length < 1) {
      const { onSubmit } = this.props;
      if (onSubmit) {
        const data = this._collectFormData(this.state.parsedData);
        onSubmit(data);
      } else {
        const $form = ReactDOM.findDOMNode(this.form);
        $form.submit();
      }
    }
  }

  validateForm() {
    const errors = [];
    let data_items = this.state.parsedData;

    if (this.props.display_short) {
      data_items = this.state.parsedData.filter((i) => i.alternateForm === true);
    }

    data_items.forEach(item => {
      if (item.element === 'Signature') {
        this._getSignatureImg(item);
      }

      if (this._isInvalid(item)) {
        errors.push(`${item.label} is required!`);
      }

      if (this.props.validateForCorrectness && this._isIncorrect(item)) {
        errors.push(`${item.label} was answered incorrectly!`);
      }
    });

    return errors;
  }

  getDataById(id) {
    const { data } = this.props;
    return data.find(x => x.id === id);
  }

  getInputElement(item) {
    if (item.custom) {
      return this.getCustomElement(item);
    }
    const Input = FormElements[item.element];
    return (<Input
      handleChange={this.handleChange}
      ref={c => this.inputs[item.field_name] = c}
      mutable={true}
      key={`form_${item.id}`}
      data={item}
      read_only={this.props.read_only}
      defaultValue={this._getDefaultValue(item)} />);
  }

  getContainerElement(item, Element) {
    const controls = item.childItems.map(x => (x ? this.getInputElement(this.getDataById(x)) : <div>&nbsp;</div>));
    return (<Element mutable={true} key={`form_${item.id}`} data={item} controls={controls} />);
  }

  getSimpleElement(item) {
    const Element = FormElements[item.element];
    return (<Element mutable={true} key={`form_${item.id}`} data={item} />);
  }

  getCustomElement(item) {
    if (!item.component || typeof item.component !== 'function') {
      item.component = Registry.get(item.key);
      if (!item.component) {
        console.error(`${item.element} was not registered`);
      }
    }

    const inputProps = item.forwardRef && {
      handleChange: this.handleChange,
      defaultValue: this._getDefaultValue(item),
      ref: c => this.inputs[item.field_name] = c,
    };
    return (
      <CustomElement
        mutable={true}
        read_only={this.props.read_only}
        key={`form_${item.id}`}
        data={item}
        {...inputProps}
      />
    );
  }

  turnPage(direction) {
    if (direction === '-') {
      if (this.state.pageNumber < 1) return;
      this.setState({ pageNumber: this.state.pageNumber - 1 });
    }

    if (direction === '+') {
      if (this.state.pageNumber + 1 >= this.state.parsedData.length) return;
      this.setState({ pageNumber: this.state.pageNumber + 1 });
    }
  }

  handleRenderSubmit = () => {
    const {
      actionName = 'Submit',
      submitButton = false,
    } = this.props;

    return submitButton || <input type='submit' className='btn btn-big' value={actionName} />;
  }

  render() {
    let data_items = this.state.parsedData.flat();

    if (this.props.display_short) {
      data_items = this.state.parsedData.filter((i) => i.alternateForm === true);
    }

    data_items.forEach((item) => {
      if (item && item.readOnly && item.variableKey && this.props.variables[item.variableKey]) {
        this.answerData[item.field_name] = this.props.variables[item.variableKey];
      }
    });

    const items = data_items.filter(x => !x.parentId).map(item => {
      if (!item) return null;
      let elem;
      switch (item.element) {
        case 'TextInput':
        case 'NumberInput':
        case 'TextArea':
        case 'Dropdown':
        case 'DatePicker':
        case 'RadioButtons':
        case 'Rating':
        case 'Tags':
        case 'Range':
          elem = this.getInputElement(item);
          break;
        case 'CustomElement':
          elem = this.getCustomElement(item);
          break;
        case 'FourColumnRow':
          elem = this.getContainerElement(item, FourColumnRow);
          break;
        case 'ThreeColumnRow':
          elem = this.getContainerElement(item, ThreeColumnRow);
          break;
        case 'TwoColumnRow':
          elem = this.getContainerElement(item, TwoColumnRow);
          break;
        case 'Signature':
          elem = <Signature ref={c => this.inputs[item.field_name] = c} read_only={this.props.read_only || item.readOnly} mutable={true} key={`form_${item.id}`} data={item} defaultValue={this._getDefaultValue(item)} />;
          break;
        case 'Checkboxes':
          elem = <Checkboxes ref={c => this.inputs[item.field_name] = c} read_only={this.props.read_only} handleChange={this.handleChange} mutable={true} key={`form_${item.id}`} data={item} defaultValue={this._optionsDefaultValue(item)} />;
          break;
        case 'Image':
          elem = <Image ref={c => this.inputs[item.field_name] = c} handleChange={this.handleChange} mutable={true} key={`form_${item.id}`} data={item} defaultValue={this._getDefaultValue(item)} />;
          break;
        case 'Download':
          elem = <Download download_path={this.props.download_path} mutable={true} key={`form_${item.id}`} data={item} />;
          break;
        case 'Camera':
          elem = <Camera ref={c => this.inputs[item.field_name] = c} read_only={this.props.read_only || item.readOnly} mutable={true} key={`form_${item.id}`} data={item} defaultValue={this._getDefaultValue(item)} />;
          break;
        default:
          elem = this.getSimpleElement(item);
          break;
      }

      return (
        <div className={this.state.pageNumber !== item.pageNumber && 'hidden'}>
          {elem}
        </div>
      )
    });

    const formTokenStyle = {
      display: 'none',
    };

    const backName = (this.props.back_name) ? this.props.back_name : 'Cancel';

    return (
      <div>
        <FormValidator emitter={this.emitter} />
        <div className='react-form-builder-form'>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div role="progressbar" style={{width: (`${this.state.pageNumber / this.state.parsedData.length * 100}%`) }} className="bg-blue-300 rounded-full h-2" />
          </div>
          <form encType='multipart/form-data' ref={c => this.form = c} action={this.props.form_action} onSubmit={this.handleSubmit.bind(this)} method={this.props.form_method}>
            {this.props.authenticity_token &&
              <div style={formTokenStyle}>
                <input name='utf8' type='hidden' value='&#x2713;' />
                <input name='authenticity_token' type='hidden' value={this.props.authenticity_token} />
                <input name='task_id' type='hidden' value={this.props.task_id} />
              </div>
            }
            {items}
            <div className="flex space-x-2">
              <div className="px-2 py-1 bg-gray-50 font-medium text-lg" onClick={() => this.turnPage('-')}>Prev</div>
              <div className="px-2 py-1 bg-gray-50 font-medium text-lg" onClick={() => this.turnPage('+')}>Next</div>
            </div>
            <div className='btn-toolbar'>
              {!this.props.hide_actions &&
                this.handleRenderSubmit()
              }
              {!this.props.hide_actions && this.props.back_action &&
                <a href={this.props.back_action} className='btn btn-default btn-cancel btn-big'>{backName}</a>
              }
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ReactForm.defaultProps = { validateForCorrectness: false };

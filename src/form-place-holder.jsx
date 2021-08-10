import React from 'react';
import PropTypes from 'prop-types';

const PLACE_HOLDER = 'form-place-holder';

export default class PlaceHolder extends React.Component {
  render() {
    return (
      this.props.show &&
      <div className="m-3 border-2 border-dashed border-gray-400 rounded-md p-4 text-center font-medium text-xl text-gray-400" >
        <div>{this.props.text}</div>
      </div>
    );
  }
}

PlaceHolder.propTypes = {
  text: PropTypes.string,
  show: PropTypes.bool,
};

PlaceHolder.defaultProps = {
  text: 'Dropzone',
  show: false,
};

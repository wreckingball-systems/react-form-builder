/**
  * <ToolbarItem />
  */

import React from 'react';
import { DragSource } from 'react-dnd';
import ItemTypes from './ItemTypes';
import ID from './UUID';

const cardSource = {
  beginDrag(props) {
    const uuid = ID.uuid();
    console.log('new element created', uuid);
    return {
      id: uuid,
      index: -1,
      data: props.data,
      onCreate: props.onCreate,
    };
  },
};

class ToolbarItem extends React.Component {
  render() {
    const { connectDragSource, data, onClick } = this.props;
    if (!connectDragSource) return null;
    return (
      connectDragSource(
        <li className="bg-white mb-2 shadow-sm rounded-lg p-2 cursor-pointer list-none flex space-x-2 items-center" onClick={onClick}>
          <div className={'bg-indigo-300 p-2 inline-flex text-indigo-600 items-center rounded-full'}><i className={data.icon} /></div>
          <span>{data.name}</span>
        </li>,
      )
    );
  }
}

export default DragSource(ItemTypes.CARD, cardSource, connect => ({
  connectDragSource: connect.dragSource(),
}))(ToolbarItem);

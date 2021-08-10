import React from 'react';
import * as PkgTextAreaAutosize from 'react-textarea-autosize';
import * as DraftJs from 'draft-js';
import * as draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import ID from '../UUID';

const generateUUID = () => ID.uuid();

const TextAreaAutosize = (props) => <PkgTextAreaAutosize {...props} />;

const parsePages = (data) => {
  const pages = [];
  let pageNumber = 0;

  data.forEach((field) => {
    pages[pageNumber] = pages[pageNumber] || [];
    if (field.element === 'PageBreak') {
      pageNumber++;
      return;
    }
    field.pageNumber = pageNumber;
    pages[pageNumber].push(field);
  });

  return pages;
};

const flatten = (arrays) => {
  console.log('Change')
  return arrays.reduce((acc, d) => {
    return [...acc, ...(d || [])];
  }, []);
};

export {
 generateUUID, flatten, TextAreaAutosize, DraftJs, draftToHtml, Editor, parsePages,
};

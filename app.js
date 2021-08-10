import React from 'react';
import ReactDOM from 'react-dom';
import DemoBar from './demobar';
// eslint-disable-next-line no-unused-vars
import FormBuilder, { Registry } from './src/index';
import * as variables from './variables';

// Add our stylesheets for the demo.
require('./scss/application.scss');

const url = '/api/formdata';
const saveUrl = '/api/formdata';

const TestComponent = () => <h2>Hello</h2>;

const MyInput = React.forwardRef((props, ref) => {
  const { name, defaultValue, disabled } = props;
  return (
    <>
      <label style={{ marginRight: '1rem' }}><b>{ props.data.label }</b></label>
      <input ref={ref} name={name} defaultValue={defaultValue} disabled={disabled} />;
    </>
  );
});

Registry.register('MyInput', MyInput);
Registry.register('TestComponent', TestComponent);

const files2 = [{
    id: 2,
    user_id: 1,
    tags: null,
    metadata: null,
    last_viewed_at: null,
    created_at: '2021-08-06T14:10:05.980-04:00',
    source: '/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU1ZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--39b0129faf8a267a05954ee10b56f4c7d1662705/Safety%20NOW.png',
    blob: {
      size: '132 KB',
      content_type: 'PNG',
      file_type: 'PNG',
      filename: 'Safety NOW.png',
    },
    user: {
      first_name: 'Cecil',
      last_name: 'Worsley',
      id: 1,
    },
  },
  {
    id: 3,
    user_id: 1,
    tags: null,
    metadata: null,
    last_viewed_at: null,
    created_at: '2021-08-06T15:41:52.715-04:00',
    source: '/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdVFZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3ac59adfab7397b5d2b4d027f3b37354f3a1b8ce/Wreckingball%20Logo.png',
    blob: {
      size: '126 KB',
      content_type: 'PNG',
      file_type: 'PNG',
      filename: 'Wreckingball Logo.png',
    },
    user: {
      first_name: 'Cecil',
      last_name: 'Worsley',
      id: 1,
    },
  },
  {
    id: 4,
    user_id: 1,
    tags: null,
    metadata: null,
    last_viewed_at: null,
    created_at: '2021-08-06T15:49:41.913-04:00',
    source: '/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdVVZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--b25fb818adf3dfee46dce3c283e4b2e25e4674c8/Wreckingball%20Logo%20-%20Ball.jpg',
    blob: {
      size: '43.6 KB',
      content_type: 'JPEG',
      file_type: 'JPG',
      filename: 'Wreckingball Logo - Ball.jpg',
    },
    user: {
      first_name: 'Cecil',
      last_name: 'Worsley',
      id: 1,
    },
  },
  {
    id: 5,
    user_id: 1,
    tags: null,
    metadata: null,
    last_viewed_at: null,
    created_at: '2021-08-06T16:22:00.638-04:00',
    source: '/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdVlZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--aa3a8e2c971690d885ac56e6590062035d0061db/Wm8ZgKQ_wYd1fGgC_REdUqV4Hq35tKjB6-recording.mp3',
    blob: {
      size: '390 KB',
      content_type: 'MPEG',
      file_type: 'MP3',
      filename: 'Wm8ZgKQ_wYd1fGgC_REdUqV4Hq35tKjB6-recording.mp3',
    },
    user: {
      first_name: 'Cecil',
      last_name: 'Worsley',
      id: 1,
    },
  }].map((file) => {
    return { ...file, id: `http://localhost:5000/${file.source}`, file_name: file.id };
  });

console.log(files2);

const items = [{
    key: 'Header',
  }, {
    key: 'TextInput',
  }, {
    key: 'TextArea',
  }, {
    key: 'RadioButtons',
  }, {
    key: 'Checkboxes',
  }, {
    key: 'Image',
  },
  {
    key: 'TwoColumnRow',
  },
  {
    key: 'ThreeColumnRow',
  },
  {
    key: 'FourColumnRow',
  },
  {
    key: 'TestComponent',
    element: 'CustomElement',
    component: TestComponent,
    type: 'custom',
    field_name: 'test_component',
    name: 'Something You Want',
    icon: 'fa fa-cog',
    static: true,
    props: { test: 'test_comp' },
    label: 'Label Test',
  },
  {
    key: 'MyInput',
    element: 'CustomElement',
    component: MyInput,
    type: 'custom',
    forwardRef: true,
    bare: true,
    field_name: 'my_input_',
    name: 'My Input',
    icon: 'fa fa-cog',
    props: { test: 'test_input' },
    label: 'Label Input',
  },
];

window.fetch('http://localhost:5000/api/v1/media_library', {
  method: 'GET',
}).then((res) => res.json())
  .then((json) => console.log(json));

ReactDOM.render(
  <FormBuilder.ReactFormBuilder
    variables={variables}
    url={url}
    files={files2}
    saveUrl={saveUrl}
    // toolbarItems={items}
  />,
  document.getElementById('form-builder'),
);

ReactDOM.render(
  <DemoBar variables={variables} />,
  document.getElementById('demo-bar'),
);

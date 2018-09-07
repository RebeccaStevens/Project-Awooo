import 'jest';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import { App } from '../App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);

  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});

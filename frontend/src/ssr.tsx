// tslint:disable

import React from 'react';
import { renderToString } from 'react-dom/server';

import { App as ReactApp } from './App';

export function renderReactApp(): string {
  return renderToString(<ReactApp />);
}

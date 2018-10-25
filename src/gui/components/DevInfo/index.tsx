/**
 * Dev info to display when in development.
 */

import React, { Component, ReactNode } from 'react';

// @ts-ignore
import { ReactComponent as Logo } from '../assets/logo.svg';

// @ts-ignore
import styles from './style.module.scss';

interface IProps {}

interface IState {}

interface ISnapShot {}

/**
 * The root component.
 */
export class DevInfo extends Component<IProps, IState, ISnapShot> {

  /**
   * Render this component.
   */
  public render(): ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.tech}>
          <span>Node.js: {process.versions.node}</span>
          <span>Chromium: {process.versions.chrome}</span>
          <span>Electron: {process.versions.electron}</span>
        </div>
      </div>
    );
  }
}

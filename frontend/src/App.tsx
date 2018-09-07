/**
 * Sample React Native App.
 */

import React, { Component, ReactNode } from 'react';

// @ts-ignore
import styles from './App.module.scss';
// @ts-ignore
import { ReactComponent as Logo } from './assets/logo.svg';

interface IProps {}

interface IState {}

interface ISnapShot {}

/**
 * The root component.
 */
export class App extends Component<IProps, IState, ISnapShot> {

  /**
   * Render this component.
   */
  public render(): ReactNode {
    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <Logo className={styles.logo}/>
          <h1 className={styles.title}>Welcome to React</h1>
        </header>
        <p className={styles.intro}>
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

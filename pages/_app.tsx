import App, { AppContext, AppProps } from 'next/app';
import { GridProvider } from '@faceless-ui/css-grid';
import { ModalContainer, ModalProvider } from '@faceless-ui/modal';
import React from 'react';
import { Header } from '../components/Header';
import { MainMenu } from '../payload-types';
import cssVariables from '../cssVariables';

import '../css/app.scss';

const PayloadApp = (appProps: AppProps<{ mainMenu: MainMenu }>): React.ReactElement => {
  const {
    Component,
    pageProps,
  } = appProps;

  return (
    <React.Fragment>
      <GridProvider
        breakpoints={{
          s: cssVariables.breakpoints.s,
          m: cssVariables.breakpoints.m,
          l: cssVariables.breakpoints.l,
        }}
        colGap={{
          s: '24px',
          m: '48px',
          l: '48px',
          xl: '72px',
        }}
        cols={{
          s: 4,
          m: 4,
          l: 12,
          xl: 12,
        }}
      >
        <ModalProvider transTime={0} zIndex="var(--modal-z-index)">
          <Header mainMenu={pageProps.mainMenu} />
          <Component {...pageProps} />

          <ModalContainer />
        </ModalProvider>
      </GridProvider>
    </React.Fragment>
  )
}

PayloadApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps
  };
};

export default PayloadApp

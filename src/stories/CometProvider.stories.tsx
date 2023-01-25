
import React from 'react';
import type { Meta } from '@storybook/react';
import { CometProvider, MintButton } from '..';

const meta: Meta<typeof CometProvider> = {
  title: 'CometProvider',
  component: CometProvider,
};

export default meta;

const IFRAME_BASE_URL = 'http://localhost:3001';

const Template = (args: any) => <CometProvider {...args} />;

export const BasicLogin = Template.bind({});
BasicLogin.args = {
  children: [
    <MintButton collectionId='8bbf071c3d5b' />,
  ],
  config: {
    iframeBaseUrl: IFRAME_BASE_URL,
    publishableKey: 'C99BHgUNx6COUQweV0DNKr1IIoor80mX',
  }
};

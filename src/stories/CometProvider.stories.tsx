
import React from 'react';
import type { Meta } from '@storybook/react';
import { CometProvider, CometButton } from '..';

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
    <CometButton />,
  ],
  config: {
    iframeBaseUrl: IFRAME_BASE_URL,
  }
};

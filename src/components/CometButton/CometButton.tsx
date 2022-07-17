
import React from 'react';
import Button from '../../lib/button';

export interface CometButtonProps {
  children: React.ReactChildren,
};

export default (props: CometButtonProps) => {
  return <Button>{props.children}</Button>;
};


import React from 'react';
import { CometContext } from '../components/CometProvider';

const useAccount = () => {
  const context = React.useContext(CometContext);

  if (context === undefined) {
    throw new Error('useModal must be used within a CometProvider');
  }

  return context.user;
}

export default useAccount;

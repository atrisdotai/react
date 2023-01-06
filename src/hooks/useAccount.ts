
import React from 'react';
import { CometContext } from '../components/CometProvider';

const useAccount = () => {
  const context = React.useContext(CometContext);

  if (context === undefined) {
    throw new Error('useAccount must be used within a CometProvider');
  }

  return React.useMemo(
    () => context.user,
    [context.user?.id],
  );
}

export default useAccount;

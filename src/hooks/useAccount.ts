
import React from 'react';
import { CometContext } from '../components/CometProvider';

interface CometAccount {
  id: string;
  username: string;
  address: string;
}

const useAccount = () => {
  const context = React.useContext(CometContext);

  if (context === undefined) {
    throw new Error('useAccount must be used within a CometProvider');
  }

  return React.useMemo<CometAccount | null>(
    () => context.user,
    [context.user?.id],
  );
}

export default useAccount;


import React from 'react';
import { CometContext } from '../components/CometProvider';

const useModal = () => {
  const context = React.useContext(CometContext);

  if (context === undefined) {
    throw new Error('useModal must be used within a CometProvider');
  }

  return {
    openModal: () => {
      // opens the iframe
      context.openModal();
    },
    closeModal: context.closeModal,
  };
}

export default useModal;


import React from 'react';
import Deferred from '../core/deferred';
import { CometContext, CometModalRequestType } from '../components/CometProvider';
import bs58 from 'bs58';

const useGetSharedSecret = ({
  publicKey,
}: {
  publicKey: string | Buffer | Uint8Array;
}) => {
  const context = React.useContext(CometContext);
  const ecdhDeferred = React.useRef<Deferred<Uint8Array> | null>(null);

  if (context === undefined) {
    throw new Error('useGetSharedSecret must be used within a CometProvider');
  }

  React.useEffect(() => {
    // listen for cometsdk_requestECDH event
    window.addEventListener('message', messageHandler);

    return () => {
      // cleanup
      window.removeEventListener('message', messageHandler);
    }
  }, []);

  const messageHandler = (event: MessageEvent) => {
    if (event.data.type === 'cometsdk_requestECDH') {
      const element = (event.source as Window);

      let publicKeyString;
      if (typeof publicKey === 'string') {
        publicKeyString = publicKey;
      } else if (publicKey instanceof Buffer) {
        publicKeyString = bs58.encode(publicKey);
      } else if (publicKey instanceof Uint8Array) {
        publicKeyString = bs58.encode(publicKey);
      }

      if (element) {
        element.postMessage({
          type: 'cometsdk_startECDH',
          value: {
            publicKey: publicKeyString,
            title: document.title,
          },
        }, context.iframeOrigin);
      }
    } else if (event.data.type === 'cometsdk_finishECDH') {
      const { success, sharedSecret } = event.data.value;

      if (ecdhDeferred.current) {
        if (success) {
          ecdhDeferred.current.resolve(sharedSecret);
        } else {
          ecdhDeferred.current.reject(new Error('User rejected shared secret request'));
        }
      }

      context.setModalRequest(null);
      context.closeModal();
    }
  };

  const getSharedSecret = () => {
    ecdhDeferred.current = new Deferred<Uint8Array>();

    context.setModalRequest({
      type: CometModalRequestType.ECDH,
      closeable: false,
      config: {
        appTitle: document.title,
      },
    });
    context.openModal();

    return ecdhDeferred.current.promise;
  }

  return {
    getSharedSecret,
  };
}

export default useGetSharedSecret;

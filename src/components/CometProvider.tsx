
import * as React from 'react';
import { postMessage } from '../core/iframe';

interface CometContextValue {
  user: any;
  openModal: () => void;
  closeModal: () => void;
  setModalRequest: (request: CometModalRequest | null) => void;
  iframeLoaded: Boolean;
  iframeOrigin: string;
  sendRpcRequest: (request: any) => Promise<any>;
};

// default values in context
export const CometContext = React.createContext<CometContextValue>({
  user: null,
  openModal: () => {},
  closeModal: () => {},
  setModalRequest: () => {},
  iframeLoaded: false,
  iframeOrigin: '',
  sendRpcRequest: () => Promise.resolve({ error: 'CometProvider not found.' }),
});

interface CometProviderConfig {
  // publishable key, required
  publishableKey: string;

  // self explanatory, the base url of the iframe
  iframeBaseUrl?: string;

  // type of chain (solana or evm)
  chainType?: string;

  // the chain id of the chain
  chainId?: number;

  // should we show full wallet
  showFullWallet?: boolean;
}

export enum CometModalRequestType {
  SignMessage = 'signmessage',
  SignTransaction = 'signtransaction',
  ECDH = 'ecdh',
  Mint = 'mint',
}

export interface CometModalRequest {
  // the type of request
  type: CometModalRequestType;

  // should i be able to close the modal?
  closeable?: boolean;

  // config of request
  config: any;
}

export default function CometProvider({
  config,
  children,
}: React.PropsWithChildren<{ config?: CometProviderConfig }>) {

  const {
    iframeBaseUrl = 'https://sdk-iframe.withcomet.com',
    chainType = 'solana',
    chainId = 101,
    showFullWallet = true,
    publishableKey,
  } = config || {};

  const iframeUrl = new URL(iframeBaseUrl);
  const origin = iframeUrl.origin;

  if (!publishableKey) throw new Error('CometProvider: publishableKey is required.');

  const [modalOpen, setModalOpen] = React.useState<Boolean>(false);
  const [modalRequest, setModalRequest] = React.useState<CometModalRequest|null>(null);
  const [iframeLoaded, setIframeLoaded] = React.useState<Boolean>(false);

  const [user, setUser] = React.useState(null);

  // Attaching and detaching event listeners
  React.useEffect(() => {
    window.addEventListener('message', handleMessage, false);

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, []);

  // Trigger modal open/close in iframe when modalOpen changes
  React.useEffect(() => {
    postMessage(
      'cometsdk_modalOpen',
      modalOpen,
      origin,
    );

    if (iframeLoaded && !modalOpen) {
      setModalRequest(null);
    }
  }, [modalOpen]);

  React.useEffect(() => {
    if (modalOpen) {
      postMessage(
        'cometsdk_modalOpen',
        true,
        origin,
      );
    }
    if (modalRequest) {
      postMessage(
        'cometsdk_modalRequest',
        modalRequest,
        origin,
      );
    }
  }, [iframeLoaded]);

  const sendRpcRequest = (request: any) => {
    const requestId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    postMessage(
      'cometsdk_rpcRequest',
      {
        id: requestId,
        request,
      },
      origin,
    );

    return new Promise((resolve, reject) => {
      const handleRpcMessage = (event: any) => {
        const { data } = event;
        if (data.type === 'cometsdk_rpcResponse' && data.value.id === requestId) {
          window.removeEventListener('message', handleRpcMessage, false);
          if (data.error) {
            reject(data.value.error);
          } else {
            resolve(data.value.response);
          }
        }
      };
      window.addEventListener('message', handleRpcMessage, false);
    });
  };

  const handleMessage = React.useCallback((event: any) => {
    const { data } = event;
    if (data.type === 'cometsdk_setUser') {
      setUser(data.value);
    } else if (data.type === 'cometsdk_modalOpen') {
      setModalOpen(data.value);
      // setModalRequest(null);
    } else if (data.type === 'cometsdk_closeModal') {
      setModalOpen(false);
    } else if (data.type === 'cometsdk_hello') {
      setIframeLoaded(true);
      postMessage(
        'cometsdk_helloBack',
        {
          chainType,
          chainId,
          path: showFullWallet ? 'loginfull' : 'loginbasic',
          publishableKey,
          query: {},
        },
        origin,
      );
    }
  }, []);

  const value = React.useMemo(() => {
    return {
      user,
      openModal: () => {
        if (iframeLoaded) postMessage(
          'cometsdk_modalOpen',
          true,
          origin,
        );
        setModalOpen(true);
      },
      closeModal: () => {
        if (iframeLoaded) postMessage(
          'cometsdk_modalOpen',
          false,
          origin,
        );
        setModalRequest(null);
        setModalOpen(false);
      },
      setModalRequest: (request: CometModalRequest | null) => {
        setModalRequest(request);
      },
      iframeLoaded,
      iframeOrigin: origin,
      sendRpcRequest,
    };
  }, [
    user,
    iframeLoaded,
    modalOpen,
    modalRequest,
  ]);

  React.useEffect(() => {
    postMessage(
      'cometsdk_modalRequest',
      modalRequest,
      origin,
    );
  }, [modalRequest]);

  return (
    <>
      <iframe
        id='cometsdk_iframe'
        className={modalOpen ? 'w-screen min-h-screen fixed' : 'w-0 h-0 absolute'}
        src={iframeBaseUrl}
      />

      <CometContext.Provider value={value}>
        {children}
      </CometContext.Provider>
    </>
  );
}


import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from '../ui/modal';
import CircleLoader from '../ui/circleLoader';

interface CometContextValue {
  user: any;
  openModal: () => void;
  closeModal: () => void;
};

// default values in context
export const CometContext = React.createContext<CometContextValue>({
  user: null,
  openModal: () => {},
  closeModal: () => {},
});

interface CometProviderConfig {
  // self explanatory, the base url of the iframe
  iframeBaseUrl?: string;

  // type of chain (solana or evm)
  chainType?: string;

  // the chain id of the chain
  chainId?: number;

  // should we show full wallet
  showFullWallet?: boolean;
}

export default function CometProvider({
  config,
  children,
}: React.PropsWithChildren<{ config: CometProviderConfig }>) {

  const {
    iframeBaseUrl = 'https://auth.withcomet.com',
    chainType = 'solana',
    chainId = 101,
    showFullWallet = true,
  } = config;

  const [modalOpen, setModalOpen] = React.useState<Boolean>(false);
  const [modalHeight, setModalHeight] = React.useState<number>(100);

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    window.addEventListener('message', handleMessage, false);
    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [])

  const handleMessage = React.useCallback((event: any) => {
    const { data } = event;
    if (data.type === 'cometsdk_contentHeight') {
      setModalHeight(data.value);
    } else if (data.type === 'cometsdk_setUser') {
      setUser(data.value);
      console.log(data.value);
    }
  }, []);

  const onCloseModal = () => {
    setModalOpen(false);
  }

  const modalRef = React.useRef<HTMLDivElement>(null);

  let iframeStyle = {
    width: '100%',
    height: `${modalHeight}px`,
  };
  if (!modalOpen) {
    iframeStyle = {
      width: '0px',
      height: '0px',
    };
  }

  const path = React.useMemo(() => {
    let path;
    if (showFullWallet) {
      path = '/gallery';
    } else {
      path = '/getwallet';
    }
    return path;
  }, []);

  const query = React.useMemo(() => {
    const query = new URLSearchParams();
    query.set('chainType', chainType);
    query.set('chainId', chainId.toString());
    return query;
  }, [chainType, chainId]);

  const value = React.useMemo(() => {
    return {
      user,
      openModal: () => { setModalOpen(true); },
      closeModal: () => { onCloseModal(); },
    };
  }, [
    user,
    setModalOpen,
  ]);

  return (
    <>
      <iframe
        className='w-0 h-0'
        src={iframeBaseUrl + '/login' + '?' + query.toString() + '&hidden=true'}
      />

      <Modal
        ref={modalRef}
        open={modalOpen}
        onClose={() => { onCloseModal(); }}
        title={
          <img src="data:image/png;base64,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" className='w-7' />
        }
        closeable={true}
      >
        <div className='w-full relative' style={{ height: Math.max(100, modalHeight) }}>
          <div className='w-full flex items-center justify-center' style={{ marginTop: 24, marginBottom: 24, position: 'absolute' }}>
            <CircleLoader size={60} />
          </div>
          <iframe
            className='w-full absolute overflow-hidden'
            src={iframeBaseUrl + path + '?' + query.toString()}
            style={iframeStyle}
          />
        </div>
      </Modal>

      <CometContext.Provider value={value}>
        {children}
      </CometContext.Provider>
    </>
  );
}


import React, { useEffect, useState } from 'react';
import Button from '../ui/button';
import CircleLoader from '../ui/circleLoader';
import Modal from '../ui/modal';
import qs from 'query-string';

const UID_CHARS = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';

const generateUID = (length: number, chars = UID_CHARS): String => {
  let str = '';
  for (let i = 0; i < length; i += 1) {
    const choice = Math.floor(Math.random() * chars.length);
    str = str + chars[choice];
  }
  return str;
};

export enum CometButtonAction {
  Login = 'login',
  Gallery = 'gallery',
  Mint = 'mint',
};

export enum CometChainType {
  EVM = 'evm',
  Solana = 'solana',
  Aptos = 'aptos',
};

export interface CometLoginResultAccount {
  address: String,
  chainType: CometChainType,
  chainId: number,
  signature: String,
}

export interface CometLoginResult {
  id: String,
  username: String,
  address?: CometLoginResultAccount,
};

export interface CometButtonProps {
  action: CometButtonAction,
  onLogin?(result: CometLoginResult): any,
  onLogout?(result: any): any,
  chainType?: CometChainType,
  chainId?: number,
  baseUrl?: String,
  tokenId?: String,
  env?: 'prod' | 'dev',
  text?: String,
};

interface CometMintState {
  // mint2Status?: string,
  // balance?: number,
  // status?: String,
  // image?: String,
  // loading?: boolean,
  // exists?: boolean,
  // tokenDef?: any,
  tokenDefinition?: any,
  mintStats?: any,
  mintData?: any,
  chainData?: any,
  hasToken?: any,
  loading?: any,
  paymentProcessing?: any,
  stripeClientSecret?: any,
  mintedOut?: any,
  mintBlocked?: any,
};

export default (props: CometButtonProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [iframeHeight, setIframeHeight] = useState<number>(0);
  const [nonce, setNonce] = useState<String|null>(null);
  const [user, setUser] = useState<CometLoginResult|null>(null);
  const [mintState, setMintState] = useState<CometMintState|null>(null);

  const [tokenDefRequestOut, setTokenDefRequestOut] = useState<boolean>(false);
  const [tokenDef, setTokenDef] = useState<any>(null);

  // validate props
  let {
    action,
    chainType,
    chainId,
    onLogin,
    onLogout,
    env = 'prod',
    text,
  } = props;

  if (!chainType) {
    chainType = CometChainType.Solana;
  }
  if (!chainId) {
    chainId = 101;
  }

  if (!Object.values(CometButtonAction).includes(action)) {
    throw new Error('Must supply a valid "action".');
  } else if (!Object.values(CometChainType).includes(chainType)) {
    throw new Error('Must supply a valid "chainType"');
  } else if (chainId === null || chainId === undefined || !Number.isInteger(chainId)) {
    throw new Error('Must supply a valid integer "chainId".');
  }

  const messageHandler = (e: any) => {
    const { type, value } = e.data || e.message || {};
    if (type === 'cometsdk_contentHeight') {
      setIframeHeight(value+3);
    } else if (type === 'cometsdk_onLogin') {
      if (onLogin) (onLogin || (() => {}))(value);
    } else if (type === 'cometsdk_setUser') {
      setUser(value);
    } else if (type === 'cometsdk_closeModal') {
      onCloseModal();
    } else if (type === 'cometsdk_onLogout') {
      if (onLogout) (onLogout || (() => {}))(value);
    } else if (type === 'cometsdk_mintState') {
      const mintVal = JSON.parse(value);
      if (mintVal.user) {
        setUser(mintVal.user);
      }
      setMintState(mintVal);
    } else if (type === 'cometsdk_navigate') {
      window.location.href = value;
    }
  };

  useEffect(() => {
    window.removeEventListener('message', messageHandler);
    window.addEventListener('message', messageHandler);
  }, []);

  useEffect(() => {
    (async () => {
      if (action === 'mint' && !tokenDefRequestOut && !tokenDef) {
        setTokenDefRequestOut(true);

        const apiBaseUrl = `https://api${env === 'prod' ? '' : '-dev'}.withcomet.com/comet`;
        // setTokenDef(await fetch(apiBaseUrl));
        const x = await fetch(apiBaseUrl + '/token/definition/' + props.tokenId);
        setTokenDef(await x.json());
        setTokenDefRequestOut(false);
      }
    })();
  }, [tokenDef, tokenDefRequestOut]);

  const onCloseModal = () => {
    setTimeout(() => { setIframeHeight(0); }, 250);
    setModalOpen(false);
  }

  const query: any = {
    chainType,
    chainId,
  };

  // const loadingScreen = (text: String) => (
  //   <>
  //     <span className='-ml-2 -mt-1.5'>
  //       <CircleLoader size={22} />
  //     </span>
  //     <span className='ml-2'>{text}</span>
  //   </>
  // );

  let path, buttonContent;
  // let buttonOnClick;
  // console.log(mintState);

  if (action === 'login') {
    path = 'getwallet';
    query.nonce = nonce;
    buttonContent = (
      text || 'Login with Comet'
    )
  } else if (action === 'mint') {
    path = 'mint';
    query.token = props.tokenId;

    buttonContent = (
      <span className='-mt-0.5'>
        <CircleLoader size={18} />
      </span>
    );

    if (mintState !== null) {
      const {
        tokenDefinition,
        mintData,
        // chainData,
        hasToken,
        paymentProcessing,
        stripeClientSecret,
        // mintedOut,
        mintBlocked,
        loading,
      } = mintState;

      const minting = (
        ['mint_pending', 'payment_processing'].includes(mintData?.mint2Status)
        // || (mintData?.mint2Status === 'mint_succeeded' && !(chainData && chainData.length))
      );

      if (!user) {
        if (tokenDefinition?.metadata?.config?.price > 0) {
          buttonContent = `Buy for $${tokenDefinition.metadata?.config?.price}`;
        } else if (tokenDefinition) {
          buttonContent = 'Claim for free';
        } else {
          buttonContent = (
            <span className='-mt-0.5'>
              <CircleLoader size={18} />
            </span>
          )
        }
      } else if (loading) {
        buttonContent = (
          <span className='-mt-0.5'>
            <CircleLoader size={18} />
          </span>
        )
      } else if (mintBlocked && !hasToken) {
        buttonContent = (
          <>
            Mint is private
          </>
        );
      } else if (minting && !hasToken) {
        buttonContent = (
          <>
            <span className='-ml-1 -mt-0.5'>
              <CircleLoader size={18} />
            </span>
            <span className='ml-2'>Minting</span>
          </>
        );
      } else if (paymentProcessing) {
        buttonContent = (
          <span className='-mt-0.5'>
            <CircleLoader size={18} />
          </span>
        )
      } else if (stripeClientSecret && !hasToken && !minting) {
        buttonContent = (
          <span className='-mt-0.5'>
            <CircleLoader size={18} />
          </span>
        )
      } else if (hasToken) {
        buttonContent = 'View your NFT';
      } else {
        if (tokenDefinition?.metadata?.config?.price > 0) {
          buttonContent = `Buy for $${tokenDefinition.metadata?.config?.price}`;
        } else if (tokenDefinition) {
          buttonContent = 'Claim for free';
        } else {
          buttonContent = (
            <span className='-mt-0.5'>
              <CircleLoader size={18} />
            </span>
          )
        }
      }
    }
  } else if (action === 'gallery') {
    path = 'gallery';
    buttonContent = user ? `@${user.username}` : (text || 'Login with Comet');
  }

  return (
    <div style={{ fontFamily: 'Work Sans' }}>
      <Modal
        open={modalOpen}
        onClose={() => { onCloseModal(); }}
        title={
          <img src="data:image/png;base64,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" className='w-7' />
        }
        closeable={true}
      >
        <div className='w-full relative' style={{ height: Math.max(100, iframeHeight) }}>
          <div className='w-full flex items-center justify-center' style={{ marginTop: 24, marginBottom: 24, position: 'absolute' }}>
            <CircleLoader size={60} />
          </div>
          <iframe
            className='w-full absolute overflow-hidden'
            style={{ height: iframeHeight, position: 'absolute', backgroundColor: 'white' }}
            src={`${props.baseUrl || 'https://auth.withcomet.com'}/${path}?${qs.stringify(query)}`}
          />
        </div>
      </Modal>

      <Button
        variant="primary"
        style={{ borderRadius: 900 }}
        onClick={() => { setModalOpen(true); setNonce(generateUID(10)); setIframeHeight(0); }}
      >
        <img src="data:image/png;base64,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" className='w-7 -mt-0.5 -mb-0.5 -ml-1 mr-1.5' />
        <div className='inline-block font-medium w-44 align-center' style={{ width: 169, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {buttonContent}
        </div>
      </Button>

      {
        (!modalOpen && action === 'gallery') && (
          <iframe
            className='hidden'
            src={`${props.baseUrl || 'https://auth.withcomet.com'}/login?nosize=1`}
          />
        )
      }

      {
        (action === 'mint') && (
          <iframe
            className='hidden'
            allow='payment'
            src={`${props.baseUrl || 'https://auth.withcomet.com'}/mintstate?nosize=1&token=${props.tokenId}&chainType=${chainType}&chainId=${chainId}`}
          />
        )
      }
    </div>
  );
};
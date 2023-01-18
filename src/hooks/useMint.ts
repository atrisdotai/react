
import React from 'react';
import { CometContext, CometModalRequestType } from '../components/CometProvider';

interface CollectionStats {
  numMinted: number;
  totalPaid: number;
};

export interface Collection {
  id: string;
  name: string;
  symbol: string;
  type: string;
  chainType: string;
  chainId: number;
  subtype: string;
  description: string;
  infiniteSupply: boolean;
  maxSupply: number;
  price: number;
  pricingModel: string;
  deployed: boolean;
  isCometToken: boolean;
  backgroundUpload: string;
  stats: CollectionStats;
}

interface MintData {
  mintId: string;
  mintStatus: string;
  mintPubkey: string;
  paymentAmount: number;
  edition: string;
  uri: string;
  confirmed: boolean;
  token: any;
}

interface MintState {
  collection: Collection;
  mintData: MintData;
};

const useMint = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const context = React.useContext(CometContext);

  const [mintState, setMintState] = React.useState<MintState | null>(null);

  if (context === undefined) {
    throw new Error('useMint must be used within a CometProvider');
  }

  React.useEffect(() => {
    // listen for mintState event
    window.addEventListener('message', messageHandler);

    return () => {
      // cleanup
      window.removeEventListener('message', messageHandler);
    }
  }, []);

  const messageHandler = (event: MessageEvent) => {
    if (event.data.type === 'cometsdk_mintState') {
      console.log(JSON.stringify(event.data.value, null, 2))
      setMintState(event.data.value);
    }
  };

  const openMint = () => {
    context.setModalRequest({
      type: CometModalRequestType.Mint,
      config: {
        collectionId,
      },
    });
    context.openModal();
  }

  const mintStatus = mintState?.mintData?.mintStatus || null;

  return {
    /** @internal */
    collection: mintState?.collection,
    /** @internal */
    mintData: mintState?.mintData,

    openMint,
    mintStatus,
  };
}

export default useMint;

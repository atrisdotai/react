
import React from 'react';
import useMint from '../hooks/useMint';
import Button from '../ui/button';
import CircleLoader from '../ui/circleLoader';

export default function MintButton({
  collectionId,
}: {
  collectionId: string;
}) {
  const { openMint } = useMint({ collectionId });

  const [collection, setCollection] = React.useState<any>(null);
  const [collectionStats, setCollectionStats] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const tokenDef = await fetch(`https://api.withcomet.com/comet/token/definition/${collectionId}`);
      const tokenDefJson = await tokenDef.json();
      setCollection(tokenDefJson);

      const tokenStats = await fetch(`https://api.withcomet.com/comet/token/definition/${collectionId}/stats`);
      const tokenStatsJson = await tokenStats.json();
      setCollectionStats(tokenStatsJson);
    })();
  }, []);

  let buttonContent = null;
  let topText = 'Mint';
  let bottomText = '';

  const pricingModel = collection?.metadata.config.pricingModel || (collection?.metadata.config.price ? 'pay_once' : 'free');

  if (collection) {
    if (pricingModel === 'free') {
      bottomText = 'for free';
    } else if (pricingModel === 'pay_once') {
      bottomText = `for $${collection?.metadata.config.price}`;
    } else if (pricingModel === 'pay_once_variable') {
      bottomText = `min. $${collection?.metadata.config.price}`;
    }
  }

  const imageContent = (
    <div style={{ height: 80, width: 80, marginLeft: -17 }}>
      {
        collection?.metadata.config.backgroundUpload ? (
          <img src={`https://prod.cometuploads.com/${collection?.metadata.config.backgroundUpload}`} alt="" style={{ height: 80, width: 80, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} />
        ) : (
          <div style={{ height: 80, width: 80, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} className='bg-slate-300 flex items-center justify-center'>
            <CircleLoader size={40} />
          </div>
        )
      }
    </div>
  )
  buttonContent = (
    <div className="flex flex-col">
      <div
        className='font-sans inline-block font-bold text-xl w-32 text-left ml-4' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {topText}
      </div>

      <div
        className='font-sans inline-block font-medium text-md -mt-2 w-32 text-left ml-4' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {bottomText}
      </div>

      {
        collectionStats && (
          <div className='font-sans inline-block font-medium text-sm w-32 text-left ml-4 text-slate-500' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {collection?.metadata.config.maxSupply - collectionStats?.minted}/{collection?.metadata.config.maxSupply} left
          </div>
        )
      }
    </div>
  )

  return (
    <Button
      onClick={() => {
        openMint();
      }}
      variant="secondary"
      style={{
        borderRadius: 15,
        height: 80,
      }}
    >
      {imageContent}
      {buttonContent}
    </Button>
  )
}

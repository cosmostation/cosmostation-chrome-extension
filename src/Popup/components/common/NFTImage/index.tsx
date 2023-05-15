import unknownImg from '~/images/symbols/unknown.png';

type NFTImageProps = {
  src?: string;
  defaultImgSrc?: string;
  alt?: string;
  className?: string;
};

export default function NFTImage({ src = 'https://', defaultImgSrc = unknownImg, alt, className }: NFTImageProps) {
  const convertIpfs = (url: string) => url.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');

  return (
    <img
      className={className}
      src={convertIpfs(src)}
      alt={alt}
      onError={(event) => {
        // eslint-disable-next-line no-param-reassign
        event.currentTarget.onerror = null;
        // eslint-disable-next-line no-param-reassign
        event.currentTarget.src = defaultImgSrc;
      }}
    />
  );
}

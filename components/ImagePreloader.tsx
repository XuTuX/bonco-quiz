
import React from 'react';
import Head from 'next/head';

interface ImagePreloaderProps {
  href: string;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({ href }) => {
  if (!href) {
    return null;
  }

  return (
    <Head>
      <link rel="preload" href={href} as="image" />
    </Head>
  );
};

export default ImagePreloader;

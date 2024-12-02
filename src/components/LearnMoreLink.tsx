// LearnMoreLink.tsx
import React from 'react';

interface LearnMoreLinkProps {
  countryCode: string;
  theme: number;
  linkData: { [countryCode: string]: { [theme: number]: string } };
}

const LearnMoreLink: React.FC<LearnMoreLinkProps> = ({ countryCode, theme, linkData }) => {
  const linkUrl = linkData[countryCode][theme];

  return (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
      Que foto é esta?
    </a>
  );
};

export default LearnMoreLink;
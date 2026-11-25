'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { InkButton } from '@/components/ui/InkButton';

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <InkButton
      variant="secondary"
      size="sm"
      icon={copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
      onClick={handleCopy}
    >
      {copied ? '链接已复制' : '分享此文'}
    </InkButton>
  );
}

export default CopyButton;

'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { trackPortalEvent } from '@/lib/portal-events';

type EventLinkProps = {
  href: string;
  eventType: string;
  eventValue?: string;
  metadata?: Record<string, unknown>;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  download?: boolean;
};

export default function EventLink({
  href,
  eventType,
  eventValue,
  metadata,
  children,
  className,
  target,
  rel,
  download,
}: EventLinkProps) {
  const onClick = () => {
    trackPortalEvent({ eventType, eventValue, metadata });
  };

  const isInternal = href.startsWith('/');

  if (isInternal && !download && !target) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target={target} rel={rel} download={download} onClick={onClick}>
      {children}
    </a>
  );
}

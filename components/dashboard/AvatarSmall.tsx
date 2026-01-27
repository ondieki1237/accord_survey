"use client";
import React from 'react';

export default function AvatarSmall({ src, alt }: { src?: string; alt?: string }) {
  if (!src) {
    // placeholder initials circle
    return (
      <div className="avatar-sm bg-gray-200 flex items-center justify-center text-sm text-gray-700">{(alt || 'U').slice(0,1)}</div>
    );
  }
  return <img src={src} alt={alt || 'avatar'} className="avatar-sm" />;
}

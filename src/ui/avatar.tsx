
import React from 'react';
const Identicon = require('react-identicons').default;

export default function Avatar(props: any) {
  const { user, width = 40, className } = props;

  if (!user) {
    return null;
  }

  return (
    <div className={"overflow-hidden rounded-full p-1.5 bg-slate-900 " + className} style={{ width, height: width }}>
      <Identicon string={user.id} size={width - 12} />
    </div>
  )
};

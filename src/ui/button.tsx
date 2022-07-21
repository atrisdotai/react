
import React from 'react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CircleLoader from './circleLoader';

export default function Button(props: any) {
  const {
    variant = 'primary', // primary, secondary
    size = 'base',
    className,
    style,
    loading = false,
    leftIcon,
    rightIcon,
    iconClassName,
    href,
    align = 'center',
    selected = false,
    rounded = 'full',
    ...rest
  } = props;

  const hasChildren = Boolean(props.children);

  let loaderSize = 24;
  let iconSize = 5;
  if (size === 'base') {
    loaderSize = 21;
    iconSize = 4;
  } else if (size === 'sm') {
    loaderSize = 16;
    iconSize = 3;
  }

  return (
    <button
      type="button"
      className={classnames(
        'transition-opacity duration-100 disabled:opacity-60 inline-flex items-center border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500',
        {
          'text-white bg-slate-600 hover:bg-slate-700': variant === 'primary',
          'text-slate-700 bg-slate-200 hover:bg-slate-300': variant === 'secondary',
          'text-slate-700 bg-transparent hover:bg-slate-400 hover:bg-opacity-30': variant === 'transparent',

          'text-base': size === 'base',
          'text-lg': size === 'lg',
          'text-sm': size === 'sm',

          'px-4 py-2': hasChildren && size === 'base',
          'px-5 py-2.5': hasChildren && size === 'lg',
          'px-2 py-1': hasChildren && size === 'sm',

          'px-2 py-2': !hasChildren && size === 'base',
          'px-2.5 py-2.5': !hasChildren && size === 'lg',
          'px-1 py-1': !hasChildren && size === 'sm',

          'justify-center': align === 'center',
          'justify-start': align === 'left',
          'justify-end': align === 'right',

          'font-bold': selected === true,
          'font-medium': selected === false,
        },
        className,
        `rounded-${rounded}`,
      )}
      disabled={loading || rest.disabled || false}
      style={style}
      {...rest}
    >
      {
        loading
          ? (
            <CircleLoader size={loaderSize} />
          )
          : (
            <React.Fragment>
              {
                leftIcon && <FontAwesomeIcon icon={leftIcon} className={classnames({ 'mr-3': hasChildren }, `h-${iconSize}`, `w-${iconSize}`, iconClassName)} />
              }
              { props.children }
              {
                rightIcon && <FontAwesomeIcon icon={rightIcon} className={classnames({ 'ml-3': hasChildren }, `h-${iconSize}`, `w-${iconSize}`, iconClassName)} />
              }
            </React.Fragment>
          )
      }
    </button>
  );
}

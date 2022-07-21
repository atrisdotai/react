
import React from 'react';
import { Dialog, Transition } from '@headlessui/react'
import classnames from 'classnames';

function Modal(props: any) {
  const {
    open,
    onClose,
    title,
    width = 'base',
    buttons = [],
    closeable = true,
  } = props;

  const closeFunction = () => {
    if (!closeable) return;
    if (onClose) onClose();
  }

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="fixed z-30 inset-0 overflow-y-auto" onClose={closeFunction}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed backdrop-blur inset-0 bg-slate-600 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={
              classnames(
                'relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full',
                {
                  'sm:max-w-lg': width === 'lg',
                  'sm:max-w-md': width === 'base',
                  'sm:max-w-sm': width === 'sm',
                }
              )
            }>
              <div className="bg-white px-4 py-1 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start w-full">
                  {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div> */}
                  <div className="mt-3 sm:mt-0 sm:text-left w-full">
                    <div className='flex w-full'>
                      {
                        title && (
                          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-slate-900 inline-block">
                            {title}
                          </Dialog.Title>
                        )
                      }
                      <div className='grow' />
                      {
                        closeable && (
                          <Transition
                            className="inline-block"
                            show={closeable}
                            enter="transition-opacity duration-75"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-75"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <button
                              className="-mt-0.5 transition-opacity duration-100 disabled:opacity-60 inline-flex items-center border border-transparent focus:outline-none"
                              // variant="transparent"
                              onClick={closeFunction}
                              disabled={!closeable}
                              tabIndex={-1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </Transition>
                        )
                      }
                    </div>
                    <div className="my-3">
                      {/* Dialog contents */}
                      {props.children}
                    </div>
                  </div>
                </div>
              </div>
              {
                (buttons && buttons.length > 0) && (
                  <div className="bg-slate-100 px-4 py-4 sm:px-6 flex flex-row-reverse">
                    {buttons}
                  </div>
                )
              }
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Modal;

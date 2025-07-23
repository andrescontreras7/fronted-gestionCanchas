import React from 'react';

const LoginLayout = ({children}) => {
  return (
    <div className='flex min-h-screen flex-col items-center bg-background justify-center p-2'>
      {children}
    </div>
  );
}

export default LoginLayout;

import React from 'react'

import '@/web/styles/reset.scss';
import { Providers } from '@/app/providers'
import { Box } from '@chakra-ui/react'

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <html>
      <body>
        <Providers>
          <Box h={'100vh'} bg={'myGray.100'}>
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  )
}

export default Layout
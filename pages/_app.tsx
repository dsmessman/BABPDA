import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import '../styles/globals.css'
import { NavigtionProvider } from "../src/contexts/navigation.context"
import { ApolloProvider } from "@apollo/client"
import client from "../lib/apollo"
import '@fontsource/atkinson-hyperlegible'

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontFamily: `'Atkinson Hyperlegible', sans-serif`,
      },
    },
    Text: {
      baseStyle: {
        fontFamily: `'Atkinson Hyperlegible', sans-serif`, 
      },
    }
  },
  fonts: {
    heading: `'Atkinson Hyperlegible', sans-serif`,
    button: `'Atkinson Hyperlegible', sans-serif`,
    text: `'Atkinson Hyperlegible', sans-serif`,
  },
  fontSizes: {},
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
    xxl: "1400px",
  },
  styles: {
    global: (props) => ({
      'html, body': {
        background: props.colorMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
      },
      a: {
        color: '#000000',
      },
    }),
  },
});

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <NavigtionProvider>
          <Component {...pageProps} />
        </NavigtionProvider>
      </ApolloProvider>
    </ChakraProvider>
  )
}

export default App

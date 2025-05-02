import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    50: '#E6E8E7',
    100: '#CDD1CF',
    200: '#B4BAB7',
    300: '#9BA3A0',
    400: '#122620', // Main primary color
    500: '#0F1E19',
    600: '#0C1613',
    700: '#090F0C',
    800: '#060706',
    900: '#030303',
  },
  accent: {
    50: '#F9F4EA',
    100: '#F3E9D5',
    200: '#ECDEC0',
    300: '#E6D3AB',
    400: '#D6AD60', // Main accent color
    500: '#C99B45',
    600: '#B88A34',
    700: '#A67923',
    800: '#956812',
    900: '#845701',
  },
  custom: {
    darkGreen: '#122620',
    sand: '#F4EBD0',
    accent: '#D6AD60',
  },
};

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'var(--font-family)',
    body: 'var(--font-family)',
  },
  colors,
  styles: {
    global: (props) => ({
      ':root': {
        '--font-family': 'Geist, system-ui, sans-serif',
      },
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'accent',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
          color: props.colorMode === 'dark' ? 'custom.darkGreen' : 'custom.sand',
          _hover: {
            bg: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
            opacity: 0.9,
          },
        }),
        outline: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
          color: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
          _hover: {
            bg: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
            color: props.colorMode === 'dark' ? 'custom.darkGreen' : 'custom.sand',
          },
        }),
      },
    },
    Switch: {
      defaultProps: {
        colorScheme: 'accent',
      },
      baseStyle: {
        track: {
          _checked: {
            bg: 'custom.accent',
          },
        },
        thumb: {
          bg: 'white',
        },
      },
    },
    Checkbox: {
      defaultProps: {
        colorScheme: 'accent',
      },
    },
    Slider: {
      defaultProps: {
        colorScheme: 'accent',
      },
      baseStyle: {
        track: {
          bg: 'gray.200',
          _dark: {
            bg: 'gray.700',
          },
        },
        filledTrack: {
          bg: 'custom.accent',
        },
        thumb: {
          bg: 'white',
          borderWidth: '2px',
          borderColor: 'custom.accent',
          _hover: {
            boxShadow: '0 0 0 3px rgba(214, 173, 96, 0.2)',
          },
          _focus: {
            boxShadow: '0 0 0 3px rgba(214, 173, 96, 0.2)',
          },
        },
      },
    },
    Heading: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
      }),
    },
    Link: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? 'custom.sand' : 'custom.darkGreen',
        _hover: {
          opacity: 0.8,
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        },
      }),
    },
  },
});

export default theme;
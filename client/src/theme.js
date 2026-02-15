import { extendTheme } from "@chakra-ui/react";

const theme = {
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: "#EEF2FF",
      100: "#E0E7FF",
      200: "#C7D2FE",
      300: "#A5B4FC",
      400: "#818CF8",
      500: "#6366F1",
      600: "#4F46E5",
      700: "#4338CA",
      800: "#3730A3",
      900: "#312E81",
    },
    slate: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "slate.900" : "slate.50",
        color: props.colorMode === "dark" ? "slate.100" : "slate.800",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      },
      code: {
        fontFamily:
          "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
        borderRadius: "lg",
      },
    },
    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: props.colorMode === "dark" ? "slate.800" : "white",
            _hover: {
              bg: props.colorMode === "dark" ? "slate.700" : "slate.100",
            },
            _focus: {
              bg: props.colorMode === "dark" ? "slate.800" : "white",
              borderColor: "brand.500",
            },
          },
        }),
      },
      defaultProps: {
        variant: "filled",
      },
    },
  },
};

export default extendTheme(theme);

import { ThemeProvider } from "styled-components";
import { pinkTheme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { Desktop } from "./components/desktop/Desktop";

export function App() {
  return (
    <ThemeProvider theme={pinkTheme}>
      <GlobalStyles />
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ThemeProvider>
  );
}

export default App;

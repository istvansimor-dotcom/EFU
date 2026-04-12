import Calculator from './components/Calculator.jsx';
import { LangProvider } from './i18n/LangContext.jsx';

export default function App() {
  return (
    <LangProvider>
      <Calculator />
    </LangProvider>
  );
}

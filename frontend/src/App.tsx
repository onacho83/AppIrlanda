import { ToastProvider } from './components/ui/Toast';
import { AppRouter } from './routes/AppRouter';
import './styles/animations.css';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;

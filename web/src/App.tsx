import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServiceGrid from './components/ServiceGrid';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServiceGrid />
      </main>
      <Footer />
    </div>
  );
}

export default App;

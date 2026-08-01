import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import SocialProof from './components/SocialProof';
import FeaturesGrid from './components/FeaturesGrid';
import HowItWorks from './components/HowItWorks';
import BenefitsStrip from './components/BenefitsStrip';
import ProductShowcase from './components/ProductShowcase';
import UseCases from './components/UseCases';
import Testimonials from './components/Testimonials';
import PricingPreview from './components/PricingPreview';
import FaqSection from './components/FaqSection';
import FinalCta from './components/FinalCta';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
      <LandingNav />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesGrid />
        <HowItWorks />
        <BenefitsStrip />
        <ProductShowcase />
        <UseCases />
        <Testimonials />
        <PricingPreview />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

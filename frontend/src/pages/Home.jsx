import ScrollReveal from "../components/ScrollReveal";
import BeardTryOnSection from "../components/BeardTryOnSection";
import FacePhotoTips from "../components/FacePhotoTips";

import FaceShapeList from "../components/FaceShapeList";
import FaceShapeSteps from "../components/FaceShapeSteps";
import FAQSection from "../components/FAQSection";
import FemaleTryOnSection from "../components/FemaleTryOnSection";
import FindPerfectHairstyle from "../components/FindPerfectHairstyle";
import Hero from "../components/Hero";
import WhyUseFaceDetector from "../components/WhyUseFaceDetector";


export default function Home() {
  return (
    <div className="bg-slate-50">
      <Hero />
      
      <ScrollReveal>
        <BeardTryOnSection />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <FemaleTryOnSection />
      </ScrollReveal>

     

      <ScrollReveal>
        <FaceShapeList />
      </ScrollReveal>

      <ScrollReveal>
        <FaceShapeSteps />
      </ScrollReveal>

      <ScrollReveal>
        <FindPerfectHairstyle />
      </ScrollReveal>

      <ScrollReveal>
        <FacePhotoTips />
      </ScrollReveal>

      <ScrollReveal>
        <WhyUseFaceDetector />
      </ScrollReveal>

      <ScrollReveal>
        <FAQSection />
      </ScrollReveal>
    </div>
  );
}

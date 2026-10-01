import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
  {
    question: "How does the face shape detector work?",
    answer:
      "Our AI analyzes key facial landmarks such as jawline, cheekbones, face length, and width to accurately identify your face shape.",
  },
  {
    question: "Do I need a clear selfie for accurate results?",
    answer:
      "Yes. A clear, well-lit photo with your full face visible helps the AI generate the most accurate results.",
  },
  {
    question: "Is my photo stored anywhere?",
    answer:
      "No. Your photo is processed securely and immediately deleted. We do not store or share your images.",
  },
  {
    question: "Can I try different hairstyles after detection?",
    answer:
      "Yes! Once your face shape is analyzed, you can explore personalized hairstyle recommendations and virtual try-ons.",
  },
  {
    question: "Does this work for both men and women?",
    answer:
      "Absolutely. Our system provides tailored suggestions for all genders and hair types.",
  },
  {
    question: "Can I use this tool multiple times?",
    answer:
      "Yes! You can analyze your face shape as many times as you want and try different photos to compare results.",
  },
  {
    question: "What devices are supported?",
    answer:
      "Our tool works on all modern devices including Android, iPhone, tablets, and laptops—no app installation required.",
  },
  {
    question: "How accurate is the face shape detection?",
    answer:
      "Our AI model is trained on thousands of face datasets and maintains above 95% accuracy when a clear, front-facing photo is used.",
  },
  {
    question: "Can I save or share my hairstyle recommendations?",
    answer:
      "Yes. After generating your results, you can save screenshots or share them with your barber, friends, or social media.",
  },
  {
    question: "Does this work with different hairstyles or makeup on?",
    answer:
      "Yes, as long as your face is clearly visible. However, avoiding heavy filters, shadows, or hair covering your face improves results.",
  },
  {
    question: "Is this tool safe and private?",
    answer:
      "Absolutely. Your images are processed securely and never stored on our servers. We take privacy very seriously.",
  },
];


  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-muted py-24 px-6">
      {/* HEADING */}
       <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
        Frequently Asked Questions
      </h2>

      <p className="text-center text-gray-600 mt-3 text-lg max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
        Quick answers to help you understand how our AI tools work.
      </p>

      {/* FAQ LIST */}
      <div className="max-w-3xl mx-auto mt-12 space-y-5">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="
              bg-white border border-transparent rounded-2xl p-5 shadow-md
              transition-all duration-500
              hover:border-sky-300
              hover:shadow-[0_12px_35px_rgba(129,140,248,0.25)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
              hover:scale-[1.02]
              group
              animate-fade-in-up
            "
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* QUESTION HEADER */}
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => toggleFAQ(idx)}
            >
              <span
                className="
                  text-lg font-semibold text-gray-900
                  transition-colors duration-500 group-hover:text-sky-400
                "
              >
                {faq.question}
              </span>

              <ChevronDown
                size={26}
                className={`
                  text-gray-500 transition-transform duration-300
                  ${openIndex === idx ? "rotate-180 text-sky-400" : ""}
                `}
              />
            </button>

            {/* ANSWER */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                openIndex === idx ? "max-h-40 mt-3" : "max-h-0"
              }`}
            >
              <p className="text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

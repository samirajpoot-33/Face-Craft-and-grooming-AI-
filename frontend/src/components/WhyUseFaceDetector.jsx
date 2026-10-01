import { Clock, Scissors, Sparkles, Smile } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function WhyUseFaceDetector() {
  const navigate = useNavigate();
  const features = [
    {
      id: 1,
      title: "Fast & Effortless",
      icon: <Clock size={36} className="text-orange-500" />,
      description:
        "Just upload a clear photo—no complex steps, no appointments. Our AI quickly detects your face shape in seconds.",
    },
    {
      id: 2,
      title: "Tailored Hairstyles",
      icon: <Scissors size={36} className="text-green-500" />,
      description:
        "Get personalized hairstyle suggestions that naturally suit your unique features and shape.",
    },
    {
      id: 3,
      title: "Accurate Results",
      icon: <Sparkles size={36} className="text-yellow-400 " />,
      description:
        "Our advanced model ensures precision with every scan—no more guessing or outdated hair advice.",
    },
    {
      id: 4,
      title: "Boosts Confidence",
      icon: <Smile size={36} className=" text-pink-600" />,
      description:
        "Picking the right hairstyle enhances your appearance and makes you feel more confident, every day.",
    },
  ];

  return (
    <div className="w-full bg-white py-20 px-6">
      
      {/* HEADING */}
       <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
        Why Use Our Face Shape Detector?
      </h2>

      <p className="text-center text-gray-600 mt-3 text-lg max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
        Find the perfect hairstyle that truly fits your face - without the guesswork.
      </p>

      {/* GRID SECTION */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mt-16">
        {features.map((f) => (
          <div
            key={f.id}
            className="
              group bg-white border border-transparent
              rounded-2xl p-8 shadow-md transition-all duration-500 ease-out
              animate-fade-in-up
              hover:scale-[1.05]
              hover:border-sky-200
              hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
            "
            style={{ animationDelay: `${f.id * 100}ms` }}
          >
            <div className="flex items-start gap-4">

              {/* ICON */}
              <div
                className="
                  transition-all duration-500
                  group-hover:-translate-y-1 group-hover:opacity-90
                "
              >
                {f.icon}
              </div>

              {/* TEXT CONTENT */}
              <div>
                <h3
                  className="
                    text-xl font-semibold text-gray-900
                    transition-colors duration-500 group-hover:text-sky-400
                  "
                >
                  {f.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  {f.description}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* CTA BUTTON */}
      <div className="flex justify-center mt-12">
        <button
           onClick={() => navigate("/hair-virtual-try#hairstyle")}
          className="
            px-10 py-4 rounded-full text-white  font-bold
            bg-linear-to-r from-sky-500 to-cyan-400
            shadow-lg hover:scale-105 hover:shadow-2xl active:scale-95
            transition-all duration-500
          "
        >
          Find My Hairstyle →
        </button>
      </div>
    </div>
  );
}

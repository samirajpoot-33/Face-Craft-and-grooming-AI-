 import { useNavigate } from "react-router-dom";
export default function FindPerfectHairstyle() {
  const navigate = useNavigate();
  const steps = [
    {
      id: 1,
      title: "Get Hairstyle Suggestions",
      color: "text-blue-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      description:
        "Once your face shape is detected, our tool will offer hairstyle recommendations tailored to your features.",
    },
    {
      id: 2,
      title: "Experiment & Save Favorites",
      color: "text-pink-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-pink-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12.1 18.55l-.1.1-.11-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05z" />
        </svg>
      ),
      description:
        "Try different styles virtually and save your top choices to share with your barber.",
    },
    {
      id: 3,
      title: "Consult Your Barber",
      color: "text-green-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="6" cy="6" r="3" />
          <path d="M6 9v6" />
          <circle cx="18" cy="6" r="3" />
          <path d="M18 9v6" />
          <path d="M3 15l6 6" />
          <path d="M21 15l-6 6" />
        </svg>
      ),
      description:
        "Share your saved styles and face shape info for a perfectly customized haircut.",
    },
    {
      id: 4,
      title: "Pro Tips",
      color: "text-yellow-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-yellow-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2a7 7 0 017 7c0 3.87-3.13 5.13-3.13 7.13v.37a1.5 1.5 0 01-1.5 1.5h-4.74a1.5 1.5 0 01-1.5-1.5v-.37C8.13 14.13 5 12.87 5 9a7 7 0 017-7z" />
          <path d="M10 22h4" />
          <path d="M9 18h6" />
        </svg>
      ),
      description:
        "For best results: Use clear photos without heavy beard or messy hair obstructing facial contours.",
    },
  ];

  return (
    <div className="bg-alt py-24 px-6">
      {/* HEADING */}
       <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
        Find Your Perfect Hairstyle
      </h2>

      <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto text-lg animate-fade-in-up animate-delay-200">
        Discover haircuts that complement your face shape using our AI-powered
        recommendations.
      </p>

      {/* STEPS GRID */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mt-16">
        {steps.map((step) => (
          <div
            key={step.id}
            className="
              group relative bg-white rounded-2xl p-10
              border border-transparent
              transition-all duration-500 ease-out
              shadow-lg text-left
              animate-fade-in-up
              hover:scale-[1.05]
              hover:border-sky-200
              hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              hover:bg-linear-to-br hover:from-white hover:to-indigo-50/40
            "
            style={{ animationDelay: `${step.id * 100}ms` }}
          >
            {/* ICON */}
            <div
              className="
              transition-all duration-500 
              group-hover:-translate-y-1 
              group-hover:opacity-90
              "
            >
              {step.icon}
            </div>

           

            {/* TITLE */}
            <h3
              className="
              mt-5 text-xl font-semibold text-gray-900
              transition-colors duration-500
              group-hover:text-sky-400
            "
            >
              {step.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div className="mt-12 flex justify-center animate-fade-in-up animate-delay-400">
        <button 
          onClick={() => navigate("/face-analyzer")}
          className="
            px-10 py-4 rounded-full text-white font-bold
            bg-linear-to-r from-sky-500 to-cyan-400
            shadow-lg shadow-sky-500/30
            hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/50
            active:scale-95
            transition-all duration-300
            flex items-center gap-2 group
          "
        >
          Get Started Now 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}

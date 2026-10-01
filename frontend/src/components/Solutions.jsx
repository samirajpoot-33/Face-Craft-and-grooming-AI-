import { Scissors, Camera, Sparkles, User } from "lucide-react";

export default function SolutionsPage() {
  const items = [
    {
      icon: <Camera size={40} className="text-sky-500" />,
      title: "AI Face Shape Detection",
      desc: "Analyze your facial geometry using advanced AI to detect your exact face shape.",
    },
    {
      icon: <Scissors size={40} className="text-pink-500" />,
      title: "Hairstyle Recommendations",
      desc: "Instantly receive professional haircut suggestions based on your face shape.",
    },
    {
      icon: <Sparkles size={40} className="text-purple-500" />,
      title: "Virtual Try-On",
      desc: "Try hairstyles, beard styles, colors, and makeup in real-time or on uploaded images.",
    },
    {
      icon: <User size={40} className="text-emerald-500" />,
      title: "Personal Grooming Tips",
      desc: "Get professional grooming tips and recommendations tailored to your face shape and features.",
    },
  ];

  return (
    <div className="pt-50 pb-20 min-h-screen bg-page px-6">
      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADER */}
        <h1 className="text-center text-6xl md:text-6xl font-extrabold bg-linear-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent animate-fade-in-up">
          Our Solutions
        </h1>
        <p className="text-slate-600 mt-3 text-center max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
          Explore FaceCraft AI’s complete suite of styling, grooming and virtual analysis tools.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
          {items.map((item, i) => (
            <div
              key={i}
              className="
                group relative bg-white rounded-2xl p-10 text-center 
                border border-slate-200
                transition-all duration-500 ease-out
                shadow-md
                animate-fade-in-up
                hover:scale-[1.05]
                hover:border-sky-200
                hover:shadow-[0_12px_35px_rgba(56,189,248,0.25)]
                hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
              "
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* ICON */}
              <div
                className="
                  mt-2 mb-4 flex justify-center 
                  transition-all duration-500 
                  group-hover:-translate-y-1
                  group-hover:opacity-90
                "
              >
                {item.icon}
              </div>

              {/* TITLE */}
              <h3
                className="
                  text-xl font-semibold text-slate-900 
                  transition-colors duration-500
                  group-hover:text-sky-500
                "
              >
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

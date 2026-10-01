import { useNavigate } from "react-router-dom";
import femaleTry1 from "../assets/tryOn/femaleTry1.mp4";
import femaleTry2 from "../assets/tryOn/femaleTry2.mp4";

export default function FemaleTryOnSection() {
  const navigate = useNavigate();
  const items = [
    {
      id: 1,
      title: "Makeup Try On",
      video: femaleTry1,
      description:
        "Try realistic AI-powered makeup looks instantly. Explore natural, glam, bridal, soft-matte, glossy, eyeliner styles, contouring, blush tones, and more — all tailored to your face.",
      button: "TRY MAKEUP NOW",
      color: "from-sky-400 to-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition",
      route: "/makeup-virtual-try#makeup",
    },
    {
      id: 2,
      title: "Hairstyle Try On",
      video: femaleTry2,
      description:
        "See which hairstyle suits your face shape best. Try long, short, bangs, waves, curls, straight, layered cuts, and trending styles — instantly and effortlessly.",
      button: "TRY HAIRSTYLES NOW",
      color: "from-sky-400 to-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition",
      route: "/hair-virtual-try#hairstyle",
    },
  ];

  return (
    <div className="w-full bg-white py-24 px-6">
      {/* HEADING */}
      <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
        AI Beauty Try On: Makeup, Hairstyles & More
      </h2>

      <p className="text-center text-gray-600 max-w-3xl mx-auto mt-4 text-lg animate-fade-in-up animate-delay-200">
        Discover your perfect look using AI-powered beauty filters. Try makeup,
        hairstyles, and enhancements instantly with realistic results.
      </p>

      {/* CARD GRID */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 mt-16">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 
                       hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] 
                       hover:scale-[1.02]
                       transition-all duration-500
                       animate-fade-in-up"
            style={{ animationDelay: `${item.id * 150}ms` }}
          >
            {/* VIDEO PREVIEW */}
            <div className="w-full h-72 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
              <video
                src={item.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* TITLE */}
            <h3 className="mt-6 text-2xl font-bold text-gray-800">
              {item.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-3 text-gray-600 leading-relaxed text-sm">
              {item.description}
            </p>

            {/* BUTTON WITH PREMIUM HOVER EFFECT */}
            <div className="mt-6 flex justify-center">
              <button
              onClick={() => navigate(item.route)}
                className={`
                  relative px-6 py-3 w-full sm:w-auto rounded-full text-white font-semibold
                  bg-linear-to-r ${item.color}
                  
                  shadow-lg transition-all duration-500
                  hover:scale-105 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]
                  active:scale-95
                  
                  after:absolute after:inset-0 after:rounded-xl
                  after:bg-white/20 after:opacity-0
                  after:transition-all after:duration-500
                  hover:after:opacity-100 hover:after:blur-sm
                `}
              >
                {item.button}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

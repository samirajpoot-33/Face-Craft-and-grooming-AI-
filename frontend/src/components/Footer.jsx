import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-gray-300 pt-20 pb-10 px-6 relative overflow-hidden">

      {/* BACKGROUND GRADIENT AURA */}
      <div className="absolute inset-0 opacity-20 bg-linear-to-br from-sky-500/20 via-cyan-400/20 to-indigo-500/20 blur-3xl pointer-events-none"></div>

      {/* CONTENT WRAPPER */}
      <div className="relative max-w-7xl mx-auto grid md:grid-cols-4 gap-12">

        {/* BRAND SECTION */}
        <div className="group p-2 rounded-xl transition-all duration-500 hover:scale-[1.02]">
          <h2 className="text-3xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            FaceCraft AI
          </h2>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">
            Your AI-powered grooming hub for personalized hairstyle, beard, and beauty suggestions — designed to boost your confidence every day.
          </p>
        </div>

        {/* NAVIGATION */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
          <ul className="space-y-3">
            {["Home", "Face Analyzer", "Hairstyles", "Beard Styles", "Makeup Try-On"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="
                    inline-block text-gray-400
                    transition-all duration-500
                    group-hover:text-sky-300

                    hover:text-sky-300 
                    hover:translate-x-1
                    hover:scale-[1.03]
                  "
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* PRODUCTS */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Products</h3>
          <ul className="space-y-3">
            {["AI Face Shape Detector", "AI Hairstyle Generator", "AI Beard Filter", "AI Beauty Enhancer"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="
                    inline-block text-gray-400
                    transition-all duration-500
                    hover:text-pink-300 
                    hover:translate-x-1
                    hover:scale-[1.03]
                  "
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* SOCIAL MEDIA */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>

          <div className="flex space-x-5 mt-4">
            {[
              { Icon: Facebook, color: "hover:bg-[#1877F2]", shadow: "hover:shadow-[#1877F2]/40" },
              { Icon: Instagram, color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", shadow: "hover:shadow-pink-500/40" },
              { Icon: Twitter, color: "hover:bg-black", shadow: "hover:shadow-white/20" },
              { Icon: Linkedin, color: "hover:bg-[#0A66C2]", shadow: "hover:shadow-[#0A66C2]/40" }
            ].map(({ Icon, color, shadow }, index) => (
              <a
                key={index}
                href="#"
                className={`
                  p-3 rounded-xl bg-white/5 border border-white/10 
                  backdrop-blur-sm transition-all duration-300 
                  hover:scale-115 hover:border-white/30 text-gray-400 hover:text-white
                  ${color} ${shadow} shadow-lg
                `}
              >
                <Icon size={20} className="transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 my-10"></div>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-400 text-sm relative">
        © {new Date().getFullYear()} FaceCraft AI — All Rights Reserved.
      </div>
    </footer>
  );
}

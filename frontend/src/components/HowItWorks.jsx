import { Camera, ScanFace, Sparkles } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      icon: <Camera size={40} className="text-sky-500" />,
      title: "Upload a Clear Photo",
      desc: "Take or upload a front-facing photo with good lighting and no filters applied.",
    },
    {
      id: 2,
      icon: <ScanFace size={40} className="text-indigo-500" />,
      title: "AI Face Analysis",
      desc: "Our AI checks jawline, symmetry and structure to detect your accurate face shape.",
    },
    {
      id: 3,
      icon: <Sparkles size={40} className="text-pink-500" />,
      title: "Get Your Results",
      desc: "Instant hairstyle, beard and grooming suggestions tailored for your face.",
    },
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white px-6">
      <div className="max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <h1 className="text-center text-4xl font-extrabold bg-linear-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
          How It Works
        </h1>
        <p className="text-slate-600 mt-3 text-center max-w-xl mx-auto">
          A quick and powerful 3-step process powered by our advanced AI.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {steps.map((step) => (
            <div
              key={step.id}
              className="
                group relative bg-white rounded-2xl p-10 text-center 
                border border-slate-200
                transition-all duration-500 ease-out
                shadow-md
                
                hover:scale-[1.03]
                hover:border-sky-200
                hover:shadow-[0_12px_35px_rgba(56,189,248,0.25)]
                hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
              "
            >

              {/* NUMBER */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div
                  className="
                  w-14 h-14 rounded-full bg-sky-100 text-sky-500 
                  flex items-center justify-center text-xl font-bold shadow 
                  transition-all duration-500
                  group-hover:bg-sky-200
                  group-hover:shadow-[0_4px_18px_rgba(56,189,248,0.35)]
                  "
                >
                  {step.id}
                </div>
              </div>

              {/* ICON */}
              <div
                className="
                mt-10 mb-4 flex justify-center 
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
                  text-xl font-semibold text-slate-900 
                  transition-colors duration-500
                  group-hover:text-sky-500
                "
              >
                {step.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                {step.desc}
              </p>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import { User, Camera, ScanFace } from "lucide-react";

export default function FaceShapeSteps() {
  const steps = [
    {
      id: 1,
      title: "Select Your Gender",
      icon: <User size={32} className="step-icon text-sky-400" />,
      description:
        "Choose Male or Female to get accurate, gender-specific results.",
    },
    {
      id: 2,
      title: "Upload a Clear Photo",
      icon: <Camera size={32} className="step-icon text-gray-400" />,
      description:
        "Take or upload a front-facing photo with good lighting showing your entire face.",
    },
    {
      id: 3,
      title: "Get Your Results",
      icon: <ScanFace size={32} className="step-icon text-green-600" />,
      description:
        "Our AI analyzes your features and reveals your face shape instantly.",
    },
  ];

  return (
    <div className="w-full bg-page py-20 px-6 ">
      
      {/* HEADING */}
      <div className="text-center mb-14 my-20">
         <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
          Find Your Face Shape in 3 Easy Steps
        </h2>
        <p className="text-gray-600 mt-3 text-lg animate-fade-in-up animate-delay-200">
          Our AI-powered analysis makes it simple to discover your perfect hairstyle match
        </p>
      </div>

      {/* STEPS GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 my-20 ">

        {steps.map((step) => (
          <div
            key={step.id}
            className="
              group relative bg-white rounded-2xl p-10 text-center 
              border border-transparent 
              transition-all duration-500 ease-out
              animate-fade-in-up
              shadow-lg
              
              hover:scale-[1.05]
              hover:border-sky-200
              hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
            "
            style={{ animationDelay: `${step.id * 150}ms` }}
          >
            {/* STEP NUMBER BADGE */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div
                className="
                w-14 h-14 rounded-full bg-sky-100 text-sky-400 
                flex items-center justify-center text-xl font-bold shadow 
                transition-all duration-500
                group-hover:bg-sky-100
                group-hover:shadow-[0_4px_18px_rgba(129,140,248,0.45)]
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
              text-xl font-semibold text-gray-900 
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
    </div>
  );
}

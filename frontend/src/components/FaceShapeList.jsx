import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FaceShapeList() {
  const navigate = useNavigate();

  const shapes = [
    {
      id: 1,
      title: "Oval",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_iu-_HrtRCgfKowrChnmrAUP9T3jHjxFyRQ&s",
      color: "from-purple-100 to-purple-50",
      border: "border-sky-300",
      textColor: "text-purple-500",
      description:
        "Balanced proportions with slightly wider forehead and soft curved edges. Suits most hairstyles.",
    },
    {
      id: 2,
      title: "Round",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl6SAuT_37CFxm-e3wgW6IOL5Msv8-UHC-Pw&s",
      color: "from-blue-100 to-blue-50",
      border:"border-sky-300",
      textColor: "text-blue-500",
      description:
        "Equal width and height with full cheeks. Styles that add height work best.",
    },
    {
      id: 3,
      title: "Square",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKvFljKXgHll49GDqYL94jZMD_O1phQ0YP-A&s",
      color: "from-yellow-100 to-yellow-50",
      border: "border-sky-300",
      textColor: "text-yellow-600",
      description:
        "Strong jawline and sharp angles. Soft layered haircuts bring balance.",
    },
    {
      id: 4,
      title: "Heart",
      image: "https://randomuser.me/api/portraits/men/85.jpg",
      color: "from-pink-100 to-pink-50",
      border: "border-sky-300",
      textColor: "text-pink-500",
      description:
        "Widest at forehead, narrow chin. Styles that add volume near jawline suit best.",
    },
    {
      id: 5,
      title: "Oblong",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVhDmkwBJXpUgcb7oVjBBI15vU_ouhHcINQ&s",
      color: "from-green-100 to-green-50",
      border: "border-sky-300",
      textColor: "text-green-600",
      description:
        "Longer than wide with straight cheek line. Side volume styles work great.",
    },
    {
      id: 6,
      title: "Diamond",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiqiTGvwLEW_5n0ml4X3_1phNUV5vxL3Vy2A&s",
      color: "from-red-100 to-rose-50",
      border: "border-sky-300",
      textColor: "text-red-500",
      description:
        "Wide cheekbones, narrow chin & forehead. Styles that add width at top or bottom fit well.",
    },
  ];

  return (
    <div className="w-full bg-page pt-20 pb-32 px-6">

      {/* SECTION TITLE */}
      <div className="text-center max-w-3xl mx-auto mb-12">
         <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
          What is My Face Shape?
        </h2>
        <p className="text-gray-700 mt-4 text-lg leading-relaxed animate-fade-in-up animate-delay-200">
          Find your face shape and discover the best hairstyles perfectly suited to your unique features.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`
              group relative bg-white rounded-2xl p-8 text-center 
              border ${shape.border}
              shadow-md transition-all duration-500 ease-out
              animate-fade-in-up
              hover:scale-[1.05]
              hover:shadow-[0_12px_35px_rgba(56,189,248,0.25)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
              hover:border-sky-300
            `}
            style={{ animationDelay: `${shape.id * 100}ms` }}
          >
            {/* IMAGE */}
            <div className="flex justify-center -mt-12 mb-4">
              <img
                src={shape.image}
                className="
                  w-24 h-24 rounded-full border-4 border-white shadow-md
                  transition-all duration-500 group-hover:scale-110
                "
              />
            </div>

            {/* BADGE NUMBER */}
            <div className="
              absolute top-4 right-4 bg-white text-gray-600 w-9 h-9 rounded-full shadow 
              flex items-center justify-center font-semibold text-sm 
              transition-all duration-500 group-hover:bg-sky-100 group-hover:text-sky-600
            ">
              {shape.id}
            </div>

            {/* TITLE */}
           <h3
              className="
              text-xl font-semibold text-gray-900 
              transition-colors duration-500
              group-hover:text-sky-400
              "
            >
              {shape.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {shape.description}
            </p>

          </div>
        ))}
      </div>
      {/* BUTTON */}
     
      <div className="mt-14 text-center">
        <button
          onClick={() => navigate("/face-analyzer")} 
          className="
            px-10 py-4 rounded-full text-white font-bold
            bg-linear-to-r from-sky-500 to-cyan-400
            shadow-lg hover:scale-105 hover:shadow-2xl active:scale-95
            transition-all duration-500
          "
        >
          
          Analyze My Face →
        </button>
      </div>

    </div>
  );
}

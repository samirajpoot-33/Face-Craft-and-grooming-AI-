import sameerImg from '../assets/team/sameer.png'
import aliImg from '../assets/team/ali.png'
import samiImg from '../assets/team/sami.png'
import yasirImg from '../assets/team/yasir.png'
export default function AboutUs() {
  const team = [
    {
      name: "Mr. Sameer",
      role: "Frontend Developer & UI Architect",
      img: sameerImg, alt: "Sameer",
      bio: "Engineered the high-performance React frontend framework with a premium design system, crafting fluid animations and micro-interactions while building fully responsive interfaces.",
    },
    {
      name: "Mr.Sami",
      role: "AI/ML Engineer",
      img: samiImg, alt: "Sami",
      bio: "Trained the face shape classification model (RandomForest), researched face landmark detection algorithms (MediaPipe), built the Python Flask microservice, and developed the skin analysis algorithm.",

    },
    {
      name: "Mr.Yasir",
      role: "Backend Developer & API Architect",
      img: yasirImg, alt: "Yasir",
      bio: "Built the Node.js/Express backend with REST APIs, developed authentication & OAuth system, integrated third-party AI APIs (AILabTools), designed the MySQL database architecture, and implemented the payment & credit system.",
    },
    {
      name: "Mr.Ali Imran",
      role: "Quality Assurance, Documentation and System Testing Engineer",
      img: aliImg, alt: "Ali",
      bio: "Conducted comprehensive quality assurance and system testing to ensure application reliability, created detailed technical documentation, and actively worked to improve the user interface and experience, making the platform more professional and user-friendly.",
    },
  ];

  return (
    <div className="min-h-screen bg-page pt-32 pb-24 px-6">

      {/* HEADER */}
      <div className="text-center max-w-4xl mx-auto mb-20">
       <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent mt-4 animate-fade-in-up">
          About FaceCraft AI
        </h1>

        <p className="text-gray-700 mt-6 text-xl leading-relaxed animate-fade-in-up animate-delay-200">
          We merge advanced AI with beauty intelligence to help people discover styles 
          that elevate confidence, identity, and self-expression.
        </p>

       
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 mb-28">
        {[
          { number: "50K+", label: "AI Face Scans" },
          { number: "98%", label: "Accuracy Rate" },
          { number: "120+", label: "Hairstyle Models" }
        ].map((stat, i) => (
          <div
            key={i}
            className="
              group bg-white rounded-2xl p-10 text-center animate-fade-in-up
              border border-transparent 
              transition-all duration-500 ease-out shadow-lg
              hover:scale-[1.03] hover:border-sky-200
              hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
            "
            style={{ animationDelay: `${300 + i * 100}ms` }}
          >
            <h3 className="text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
              {stat.number}
            </h3>
            <p className="text-gray-700 mt-4 text-lg">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* OUR MISSION */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 mb-28">

        {/* IMAGE */}
        <div className="relative animate-fade-in-up animate-delay-300">
          <div className="absolute inset-0 bg-linear-to-br from-sky-300/30 to-cyan-300/30 blur-2xl rounded-3xl"></div>

          <img
            src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg"
            className="relative rounded-3xl shadow-2xl w-full h-full object-cover"
            alt='team'
          />
        </div>

        {/* TEXT */}
        <div className="flex flex-col justify-center animate-fade-in-up animate-delay-400">
          <h2 className="text-4xl font-bold text-gray-900 mb-5 animate-fade-in-up">
            Our Mission
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            FaceCraft AI exists to empower people with personalized styling
            through real artificial intelligence. Our technology analyzes facial
            structure, symmetry, and aesthetic patterns to recommend hairstyles,
            beard styles, and beauty enhancements uniquely made for you.
          </p>

          <ul className="space-y-4 text-lg text-gray-800">
            <li>• AI Face Shape Detection</li>
            <li>• Smart Hairstyle Prediction Models</li>
            <li>• Beauty & Grooming Recommendation Engine</li>
            <li>• Virtual Try-On + AI Styling Assistant</li>
          </ul>
        </div>
      </div>

      {/* VALUES */}
      <div className="max-w-7xl mx-auto text-center mb-24">
        <h2 className="text-4xl font-bold bg-linear-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text mb-12 animate-fade-in-up">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Innovation First",
              desc: "We develop cutting-edge AI that solves real styling challenges.",
            },
            {
              title: "Design Matters",
              desc: "We craft premium, intuitive, and globally competitive UI experiences.",
            },
            {
              title: "Confidence for All",
              desc: "Our goal is to help people discover their best, most authentic self.",
            }
          ].map((value, i) => (
            <div
              key={i}
              className="
                group bg-white rounded-3xl p-10 border border-transparent animate-fade-in-up
                shadow-lg transition-all duration-500 ease-out
                hover:scale-[1.03] hover:border-sky-200
                hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
                hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              "
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-sky-400 transition">
                {value.title}
              </h3>
              <p className="text-gray-700 mt-4">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text animate-fade-in-up">
          Meet the Creators Behind FaceCraft AI
        </h2>
        <p className="text-gray-700 mt-4 text-lg animate-fade-in-up animate-delay-200">A passionate team innovating the future of AI beauty.</p>
      </div>

      {/* TEAM GRID */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {team.map((member, index) => (
          <div
            key={index}
            className="
              group bg-white rounded-3xl p-10 shadow-lg border border-transparent animate-fade-in-up
              hover:scale-[1.03] hover:border-sky-200 hover:shadow-[0_12px_35px_rgba(129,140,248,0.35)]
              hover:bg-linear-to-br hover:from-white hover:to-sky-50/40
              transition-all duration-500 ease-out text-center
            "
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <img
              src={member.img}
              className="
                w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg
                group-hover:border-sky-300 transition-all duration-500
              "
            />

            <h3 className="text-xl font-bold mt-5 text-gray-900 group-hover:text-sky-400 transition">
              {member.name}
            </h3>
            <p className="text-sky-500 font-semibold">{member.role}</p>
            <p className="text-gray-700 text-sm mt-3 leading-relaxed">{member.bio}</p>
          </div>
        ))}

      </div>
    </div>
  );
}

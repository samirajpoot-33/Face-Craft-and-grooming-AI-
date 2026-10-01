import { Camera, User, RefreshCcw, Image as ImageIcon, Sparkles } from "lucide-react";

export default function Dashboard() {
  const savedScans = [
    { id: 1, date: "Dec 6, 2025", shape: "Oval", img: "https://i.ibb.co/5GzXkwq/avatar.png" },
    { id: 2, date: "Dec 3, 2025", shape: "Square", img: "https://i.ibb.co/5GzXkwq/avatar.png" },
  ];

  return (
    <div className="min-h-screen bg-page pt-28 pb-20 px-6 relative">

      {/* BACKGROUND BLURS */}
      <div className="absolute top-10 right-0 w-[350px] h-[350px] bg-sky-300/30 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-10 left-0 w-[350px] h-[350px] bg-cyan-300/30 blur-[150px] rounded-full"></div>

      {/* PAGE TITLE */}
      <h1 className="text-5xl font-extrabold text-center mb-6 bg-linear-to-r from-sky-500 to-cyan-400 text-transparent bg-clip-text">
        Your Dashboard
      </h1>
      <p className="text-center text-gray-600 text-lg mb-12">
        Manage your scans, try-on sessions, and AI styling recommendations
      </p>

      {/* TOP GRID: PROFILE + STATS */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 mb-16">

        {/* PROFILE CARD */}
        <div className="
          bg-white rounded-3xl shadow-xl border border-gray-200 p-8
          hover:shadow-2xl transition transform hover:-translate-y-1
        ">
          <div className="flex flex-col items-center">
            <img
              src="https://i.ibb.co/5GzXkwq/avatar.png"
              className="w-28 h-28 rounded-full shadow-xl border-4 border-white"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">Your Name</h2>
            <p className="text-gray-500 text-sm">Premium User</p>

            <button className="
              mt-5 px-6 py-2 rounded-full text-white font-semibold
              bg-linear-to-r from-sky-500 to-cyan-400
              shadow-md hover:shadow-xl hover:scale-105 transition
              flex items-center gap-2
            ">
              <User size={18} /> Edit Profile
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
          {[
            { label: "Total Scans", value: "12", icon: Camera },
            { label: "Saved Looks", value: "5", icon: ImageIcon },
            { label: "Best Match Score", value: "92%", icon: Sparkles },
          ].map((stat, i) => (
            <div
              key={i}
              className="
                bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center
                hover:shadow-2xl transition transform hover:-translate-y-1
              "
            >
              <stat.icon size={32} className="mx-auto text-sky-500 mb-3" />
              <h3 className="text-4xl font-extrabold text-gray-800">{stat.value}</h3>
              <p className="text-gray-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SAVED SCANS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Recent Face Scans</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedScans.map((scan) => (
            <div
              key={scan.id}
              className="
                bg-white rounded-3xl border border-gray-200 shadow-xl p-6
                hover:shadow-2xl hover:-translate-y-1 transition relative
              "
            >
              <img
                src={scan.img}
                className="w-full h-52 object-cover rounded-2xl mb-4 shadow-md"
              />

              <p className="text-gray-500 text-sm">{scan.date}</p>
              <p className="mt-1 text-lg font-semibold text-gray-800">Face Shape: {scan.shape}</p>

              <button className="
                mt-4 w-full py-2 rounded-xl bg-linear-to-r from-sky-500 to-cyan-400 
                text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition
                flex items-center justify-center gap-2
              ">
                <RefreshCcw size={18} /> Re-Analyze
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

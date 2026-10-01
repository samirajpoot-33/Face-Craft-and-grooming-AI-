import ScrollReveal from "../components/ScrollReveal";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-section pt-28 pb-24 px-6 relative overflow-hidden">

      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-300/25 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/25 blur-[150px] rounded-full"></div>

      {/* HEADER */}
      <ScrollReveal className="text-center max-w-3xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent mt-4">
          Get in Touch
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          We'd love to hear from you. Whether you have a question, feedback, or collaboration idea —
          the FaceCraft AI team is here to help.
        </p>
      </ScrollReveal>

      {/* MAIN CARD */}
      <ScrollReveal
        delay={0.2}
        className="
        max-w-6xl mx-auto mt-16 grid md:grid-cols-2 gap-10 
        bg-white/80 backdrop-blur-xl border border-white/60
        shadow-2xl rounded-3xl p-10 relative z-10
        "
      >

        {/* LEFT SECTION - CONTACT INFO */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 font-primary">Contact Information</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Reach out to us anytime. Our support team usually responds within a few hours.
          </p>

          <div className="space-y-5 text-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
                <Mail size={22} />
              </div>
              <p className="text-lg">support@facecraft.ai</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-100 text-cyan-600">
                <Phone size={22} />
              </div>
              <p className="text-lg">+92 (555) 234-6789</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <MapPin size={22} />
              </div>
              <p className="text-lg">Islambad — PAK</p>
            </div>
          </div>

          {/* SMALL BADGE */}
          <div className="mt-10 p-3 rounded-xl bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-100 shadow">
            <p className="text-sm text-gray-700">
              ⭐ FaceCraft AI is trusted by thousands of users worldwide.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION — CONTACT FORM */}
        <form
          className="
          bg-white shadow-xl rounded-2xl p-8 border border-gray-200
          hover:shadow-2xl hover:-translate-y-1 transition-all duration-500
          "
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h3>

          <div className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-gray-700 font-medium font-primary">Your Name</label>
              <input
                type="text"
                className="
                  w-full mt-1 px-4 py-3 rounded-xl border border-gray-300
                  focus:ring-2 focus:ring-sky-400 focus:outline-none
                  transition bg-gray-50
                "
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-700 font-medium font-primary">Email Address</label>
              <input
                type="email"
                className="
                  w-full mt-1 px-4 py-3 rounded-xl border border-gray-300
                  focus:ring-2 focus:ring-cyan-400 focus:outline-none
                  transition bg-gray-50
                "
                placeholder="you@example.com"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-gray-700 font-medium font-primary">Message</label>
              <textarea
                rows="4"
                className="
                  w-full mt-1 px-4 py-3 rounded-xl border border-gray-300
                  focus:ring-2 focus:ring-sky-400 focus:outline-none
                  transition bg-gray-50
                "
                placeholder="Write your message..."
              ></textarea>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="
              w-full py-3 text-white font-semibold rounded-xl 
              bg-linear-to-r from-sky-500 to-cyan-400
              hover:shadow-xl hover:scale-[1.02] transition-all
              flex items-center justify-center gap-2
              "
            >
              <Send size={18} />
              Send Message
            </button>
          </div>
        </form>
      </ScrollReveal>
    </div>
  );
}

import { useState } from "react";

const styles = ["/styles/style1.png", "/styles/style2.png", "/styles/style3.png"];

export default function TryOn() {
  const [image, setImage] = useState(null);
  const [overlay, setOverlay] = useState(null);

  return (
    <div className="mt-32 max-w-6xl mx-auto px-6 text-white">
      <h1 className="text-4xl font-bold text-center mb-10 animate-fade-in-up bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
        Virtual Try-On
      </h1>

      <div className="grid md:grid-cols-2 gap-12">
        
        {/* uploaded image */}
        <div className="bg-white/10 p-6 rounded-xl border-white/20 border animate-fade-in-up animate-delay-200">
          {image && (
            <div className="relative w-full h-[450px] rounded-xl overflow-hidden">
              <img src={URL.createObjectURL(image)} className="absolute w-full h-full object-cover" />
              {overlay && (
                <img src={overlay} className="absolute -top-5 w-full object-contain" />
              )}
            </div>
          )}

          <input
            type="file"
            className="mt-4"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {/* style selection */}
        <div className="bg-white/10 p-6 rounded-xl border-white/20 border animate-fade-in-up animate-delay-300">
          <h2 className="text-2xl pb-4 animate-fade-in-up">Select Hairstyle</h2>
          <div className="grid grid-cols-3 gap-4">
            {styles.map((style, i) => (
              <img
                key={i}
                src={style}
                onClick={() => setOverlay(style)}
                className="bg-white/10 p-2 rounded-xl cursor-pointer hover:bg-white/20"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

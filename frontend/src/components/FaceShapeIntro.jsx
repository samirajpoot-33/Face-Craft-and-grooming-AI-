export default function FaceShapeIntro() {
  return (
    <div className="w-full bg-section py-20 px-6">

      <div className="max-w-5xl mx-auto text-center">
        {/* TITLE */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up">
          Face Shape Detector for Hairstyles
        </h2>

        {/* SUBTEXT 1 */}
        <p className="text-gray-700 text-lg md:text-xl mt-6 leading-relaxed animate-fade-in-up animate-delay-200">
          Ever wondered why a certain hairstyle suits someone else perfectly but not you?
          Use our face shape test and app to discover your unique facial structure.
        </p>

        {/* SUBTEXT 2 */}
        <p className="text-gray-600 text-lg mt-6 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animate-delay-300">
          It's not about luck—it's about knowing your face shape. Our AI-powered face shape calculator 
          helps you make hairstyle choices that truly enhance your features.
        </p>
      </div>

    </div>
  );
}

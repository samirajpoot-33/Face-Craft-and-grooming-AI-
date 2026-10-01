export default function FaceShapeHowItWorks() {
  return (
    <div className="w-full bg-muted py-24 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT ILLUSTRATION */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-2 m-10 shadow-md">
            <img
              src="https://faceshapeai.mendeserve.com/images/Face.png"
              alt="Face Scan Illustration"
              className="w-[380px] h-auto object-contain m-10"
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div>
          {/* TITLE */}
          <h2 className="text-center text-4xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
           How to Determine Your Face Shape?
          </h2>

          {/* DESCRIPTION */}
          <p className="text-gray-600 mt-4 leading-7 text-lg">
            Wondering how to figure out your face shape? We use advanced facial 
            recognition and landmark detection to analyze key features of your face:
          </p>

          {/* BULLET LIST */}
          <ul className="mt-5 space-y-3 text-gray-700 text-lg">
            <li className="flex items-center gap-2">• Forehead width</li>
            <li className="flex items-center gap-2">• Cheekbone width</li>
            <li className="flex items-center gap-2">• Jawline shape</li>
            <li className="flex items-center gap-2">• Face length</li>
          </ul>

          {/* EXTRA DESCRIPTION */}
          <p className="text-gray-600 mt-6 leading-7 text-lg">
            Our trained machine learning model compares your unique proportions 
            with a database of known face shapes, and delivers your result within 
            seconds — no confusing steps or manual measuring.
          </p>

          <p className="text-gray-600 mt-4 leading-7 text-lg">
            All you need is a clear selfie. We handle the rest.
          </p>
        </div>
      </div>
    </div>
  );
}

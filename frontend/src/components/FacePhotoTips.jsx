import { CheckCircle, XCircle } from "lucide-react";

export default function FacePhotoTips() {
  const doThis = [
    "Use a clear, well-lit photo",
    "Face the camera straight on",
    "Remove hats, glasses, and headphones",
    "Keep your entire face visible (forehead to chin)",
    "Use a natural expression (no exaggerated faces)",
    "Take a recent photo (no old or outdated pictures)",
    "Avoid filters and beauty modes",
    "Tie or pin back long hair if needed",
    "Take the photo in portrait mode",
  ];

  const dontThis = [
    "Take photos in poor or dark lighting",
    "Tilt or turn your head at an angle",
    "Hide parts of your face with sunglasses or clothing",
    "Crop your face too tightly",
    "Make silly or exaggerated faces",
    "Use old photos like high school pictures",
    "Use cartoon or heavy beauty filters",
    "Let your hair cover half your face",
    "Upload group photos where it's hard to tell who you are",
  ];

  return (
    <div className="w-full bg-muted py-20 px-6">
      
      {/* Heading */}
      <h2 className="text-center text-4xl font-extrabold bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
        Tips to Take the Perfect Face Photo
      </h2>

      {/* CARD CONTAINER */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-10 mt-10">

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT: DO THIS */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="text-green-600" size={26} />
              <h3 className="text-xl font-semibold text-green-700">Do This</h3>
            </div>

            <div className="flex flex-col gap-4">
              {doThis.map((item, i) => (
                <div
                  key={i}
                  className="bg-green-50 border border-green-200 text-green-700 
                             px-5 py-3 rounded-xl shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DON'T DO THIS */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <XCircle className="text-red-600" size={26} />
              <h3 className="text-xl font-semibold text-red-700">Don’t Do This</h3>
            </div>

            <div className="flex flex-col gap-4">
              {dontThis.map((item, i) => (
                <div
                  key={i}
                  className="bg-red-50 border border-red-200 text-red-700 
                             px-5 py-3 rounded-xl shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

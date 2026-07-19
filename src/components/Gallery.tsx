import { useState } from "react";

export default function Gallery() {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const images = [
    { id: 1, src: "/gallery/photo1.jpg", title: "Sri Venkateswara Swamy" },
    { id: 2, src: "/gallery/photo2.jpg", title: "Divine Aarti" },
    { id: 3, src: "/gallery/photo3.jpg", title: "Sacred Darshan" },
    { id: 4, src: "/gallery/photo4.jpg", title: "Temple Procession" },
    { id: 5, src: "/gallery/photo5.jpg", title: "Annadanam Offering" },
    { id: 6, src: "/gallery/photo6.jpg", title: "Rathotsavam" },
    { id: 7, src: "/gallery/photo7.jpg", title: "Evening Aarti" },
    { id: 8, src: "/gallery/photo8.jpg", title: "Holy Sanctum" },
    { id: 9, src: "/gallery/photo9.jpg", title: "Brahmotsavam" },
    { id: 10, src: "/gallery/photo10.jpg", title: "Divine Blessings" },
    { id: 11, src: "/gallery/photo11.jpg", title: "Flower Decoration" },
    { id: 12, src: "/gallery/photo12.jpg", title: "Temple Celebrations" },
    { id: 13, src: "/gallery/photo13.jpg", title: "Divine Presence" },
  ].filter(img => !failedImages.has(img.id));

  const handleError = (id: number) => {
    setFailedImages(prev => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-cinzel text-3xl font-bold text-[#78350f]">Divine Gallery</h2>
        <p className="text-stone-600 text-sm font-medium">
          Experience the spiritual bliss through these sacred glimpses
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-4xl mb-4">🛕</p>
          <p className="font-cinzel text-lg font-semibold text-[#78350f]">Gallery Coming Soon</p>
          <p className="text-sm mt-2">
            Please copy your photos to <code className="bg-orange-50 px-2 py-0.5 rounded text-[#b45309]">public/gallery/</code> folder named <code className="bg-orange-50 px-2 py-0.5 rounded text-[#b45309]">photo1.jpg</code>, <code className="bg-orange-50 px-2 py-0.5 rounded text-[#b45309]">photo2.jpg</code>, etc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(img => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden shadow-md border border-orange-200 aspect-[3/4] bg-stone-100"
            >
              <img
                src={img.src}
                alt={img.title}
                onError={() => handleError(img.id)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#78350f]/90 via-[#78350f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <h3 className="text-orange-50 font-cinzel font-bold text-lg tracking-wide">
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

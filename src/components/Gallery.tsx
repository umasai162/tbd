export default function Gallery() {
  const images = [
    { id: 1, src: "https://images.unsplash.com/photo-1608958416715-09dfc249a05b?q=80&w=600&auto=format&fit=crop", title: "Temple Gopuram" },
    { id: 2, src: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop", title: "Divine Sanctum" },
    { id: 3, src: "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600&auto=format&fit=crop", title: "Evening Aarti" },
    { id: 4, src: "https://images.unsplash.com/photo-1621847468516-1ed0d0df5a87?q=80&w=600&auto=format&fit=crop", title: "Sacred Pillars" },
    { id: 5, src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop", title: "Temple Architecture" },
    { id: 6, src: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=600&auto=format&fit=crop", title: "Devotional Chants" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-cinzel text-3xl font-bold text-[#78350f]">Divine Gallery</h2>
        <p className="text-stone-600 text-sm font-medium">Experience the spiritual bliss through these sacred glimpses</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(img => (
          <div key={img.id} className="group relative rounded-2xl overflow-hidden shadow-md border border-orange-200 aspect-square">
            <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#78350f]/90 via-[#78350f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <h3 className="text-orange-50 font-cinzel font-bold text-lg tracking-wide">{img.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

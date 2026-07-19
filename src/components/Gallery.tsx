export default function Gallery() {
  const images = [
    { id: 1, src: "https://i.pinimg.com/736x/89/36/53/893653dcabef62a900971b4a9f62243d.jpg", title: "Sri Venkateswara Swamy" },
    { id: 2, src: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk3dktjLv8vlCzQQfJ8BQ_U5kQK65J_AbO18JNeivtsTKpUFD4UiF39uHr4M1JCB0ava57sBxaoeRXN8XyB0DcdSql-DBpbDcLdf0lZWN-bek6KOvDfR8n5anuKXyOo0th0RG-V=s1600", title: "STBL Temple View" },
    { id: 3, src: "https://i.pinimg.com/originals/db/bb/bb/dbbbbbb52d9c02da3c6fc98c0b5f54cc.jpg", title: "Evening Aarti" },
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

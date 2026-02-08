import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const galleryImages = [
  {
    id: 1,
    src: '/assets/generated/gallery-plushies-1.dim_1024x1024.png',
    title: 'Pastel Plushie Collection',
    description: 'A cozy bed display featuring adorable plushies in pink and baby blue',
  },
  {
    id: 2,
    src: '/assets/generated/gallery-plushies-2.dim_1024x1024.png',
    title: 'Bunny & Bear Friends',
    description: 'Cute plush bunny and bear posed together with soft studio lighting',
  },
  {
    id: 3,
    src: '/assets/generated/gallery-plushies-3.dim_1024x1024.png',
    title: 'Organized Plushie Shelf',
    description: 'Neatly arranged plush toys with pink and baby blue decor accents',
  },
  {
    id: 4,
    src: '/assets/generated/gallery-plushies-4.dim_1024x1024.png',
    title: 'Plushie Tea Party',
    description: 'A charming miniature tea party scene with pastel props and plushies',
  },
  {
    id: 5,
    src: '/assets/generated/gallery-plushies-5.dim_1024x1024.png',
    title: 'Soft Fabric Textures',
    description: 'Close-up details of plush fabric in pink and baby blue tones',
  },
  {
    id: 6,
    src: '/assets/generated/gallery-plushies-6.dim_1024x1024.png',
    title: 'Adventure Plushie',
    description: 'A travel-ready plushie with tiny backpack against a pastel sky',
  },
];

export default function GalleryPage() {
  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore beautiful plushie collections, displays, and adorable setups from our community.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image) => (
          <Card key={image.id} className="overflow-hidden border-2 shadow-soft transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={image.src}
                alt={image.description}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{image.title}</CardTitle>
              <CardDescription>{image.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const galleryImages = [
  {
    id: 1,
    src: '/assets/generated/plushie-haven-logo.dim_512x512.png',
    title: 'Cozy Corner Display',
    description: 'A beautifully arranged plushie collection in a reading nook',
  },
  {
    id: 2,
    src: '/assets/generated/plushie-haven-hero.dim_1600x900.png',
    title: 'Shelf Organization',
    description: 'Thoughtfully curated shelf display with varied sizes',
  },
  {
    id: 3,
    src: '/assets/generated/plushie-haven-pattern.dim_1024x1024.png',
    title: 'Texture Details',
    description: 'Close-up of plush fabric textures and materials',
  },
  {
    id: 4,
    src: '/assets/generated/plushie-haven-logo.dim_512x512.png',
    title: 'Travel Companions',
    description: 'Plushies ready for adventure',
  },
  {
    id: 5,
    src: '/assets/generated/plushie-haven-hero.dim_1600x900.png',
    title: 'Seasonal Display',
    description: 'Themed arrangement for the current season',
  },
  {
    id: 6,
    src: '/assets/generated/plushie-haven-pattern.dim_1024x1024.png',
    title: 'Care Station',
    description: 'Dedicated space for plushie maintenance and care',
  },
];

export default function GalleryPage() {
  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore beautiful plushie collections, displays, and care setups from our community.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image) => (
          <Card key={image.id} className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={image.src}
                alt={image.title}
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

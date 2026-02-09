import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const brands = [
  {
    name: 'Squishmallows',
    description: 'Ultra-soft, collectible plushies known for their marshmallow-like texture and diverse characters.',
    specialty: 'Collectible',
  },
  {
    name: 'Jellycat',
    description: 'Luxurious, whimsical plushies with unique designs and premium materials from London.',
    specialty: 'Premium',
  },
  {
    name: 'Steiff',
    description: 'Historic German brand famous for the original teddy bear and heirloom-quality craftsmanship.',
    specialty: 'Heritage',
  },
  {
    name: 'GUND',
    description: 'Classic American brand creating huggable, high-quality plush toys since 1898.',
    specialty: 'Classic',
  },
  {
    name: 'Sanrio',
    description: 'Japanese brand featuring beloved characters like Hello Kitty, My Melody, and Cinnamoroll.',
    specialty: 'Character',
  },
  {
    name: 'San-X (Rilakkuma)',
    description: 'Japanese brand known for Rilakkuma, Sumikko Gurashi, and other adorable relaxed characters.',
    specialty: 'Character',
  },
  {
    name: 'TY (Beanie Babies)',
    description: 'Iconic brand that sparked the collectible plush phenomenon with Beanie Babies.',
    specialty: 'Collectible',
  },
  {
    name: 'Aurora World',
    description: 'Diverse collection of plushies featuring realistic animals and fantasy creatures.',
    specialty: 'Variety',
  },
  {
    name: 'Build-A-Bear',
    description: 'Interactive experience allowing you to create and customize your own stuffed animals.',
    specialty: 'Custom',
  },
  {
    name: 'Kaloo',
    description: 'French brand offering soft, elegant plushies perfect for all ages.',
    specialty: 'Premium',
  },
  {
    name: 'Douglas Cuddle Toys',
    description: 'Family-owned company creating realistic and whimsical plush animals since 1956.',
    specialty: 'Classic',
  },
  {
    name: 'Trudi',
    description: 'Italian brand known for lifelike, high-quality plush animals with attention to detail.',
    specialty: 'Premium',
  },
  {
    name: 'Bellzi',
    description: 'Adorable, chubby plushies with a distinctive cute aesthetic and vibrant colors.',
    specialty: 'Cute',
  },
];

export default function PlushieBrandsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Plushie Brands
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the most beloved plushie brands from around the world. Each brand brings its own unique style, 
          quality, and charm to the wonderful world of soft companions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <Card key={brand.name} className="hover:shadow-gentle transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl">{brand.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {brand.specialty}
                </Badge>
              </div>
              <CardDescription className="text-base leading-relaxed">
                {brand.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          About This List
        </h2>
        <p className="text-gray-700 leading-relaxed">
          This curated collection represents some of the most popular and respected plushie brands in the community. 
          Whether you're looking for collectible treasures, premium quality, or adorable companions, these brands 
          offer something special for every plushie enthusiast. Each brand has its own unique history, design 
          philosophy, and devoted following.
        </p>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const brands = [
  {
    name: 'LittleForBig',
    description: 'Popular ABDL brand offering a wide range of adult pacifiers in various colors, sizes, and designs with quality silicone nipples.',
    specialty: 'Variety',
  },
  {
    name: 'Rearz',
    description: 'Canadian ABDL brand known for durable, high-quality adult pacifiers with comfortable orthodontic designs.',
    specialty: 'Quality',
  },
  {
    name: 'Tykables',
    description: 'American ABDL company offering colorful, playful adult pacifiers with cute designs and reliable construction.',
    specialty: 'Playful',
  },
  {
    name: 'NUK',
    description: 'Trusted baby brand whose larger sizes work well for adults seeking orthodontic nipple shapes and medical-grade materials.',
    specialty: 'Medical Grade',
  },
  {
    name: 'Adult Baby Designs',
    description: 'Specialized ABDL retailer offering custom and standard adult pacifiers with personalization options.',
    specialty: 'Custom',
  },
  {
    name: 'Pacifier Addict',
    description: 'Boutique brand creating unique, handcrafted adult pacifiers with decorative shields and custom artwork.',
    specialty: 'Artisan',
  },
  {
    name: 'ABU (ABUniverse)',
    description: 'Well-established ABDL brand providing comfortable adult pacifiers designed specifically for adult mouths.',
    specialty: 'Comfort',
  },
  {
    name: 'Bambino',
    description: 'Premium ABDL brand offering high-quality adult pacifiers with attention to detail and durability.',
    specialty: 'Premium',
  },
  {
    name: 'Cuddlz',
    description: 'UK-based ABDL brand featuring adult pacifiers in various styles from simple to decorative designs.',
    specialty: 'European',
  },
  {
    name: 'Dotty Diaper Company',
    description: 'Boutique ABDL retailer offering curated selection of adult pacifiers with cute, whimsical designs.',
    specialty: 'Boutique',
  },
];

export default function AdultPacifierBrandsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Adult Pacifier Brands
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore trusted brands offering adult pacifiers designed for comfort, quality, and self-soothing. 
          Each brand brings unique designs and features to support your comfort needs.
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
          This curated collection represents reputable brands offering adult pacifiers for comfort, stress relief, 
          and self-soothing. Whether you're looking for medical-grade materials, custom designs, or playful aesthetics, 
          these brands provide safe, quality options designed specifically for adult use. Always choose products that 
          meet your comfort and safety needs.
        </p>
      </div>
    </div>
  );
}

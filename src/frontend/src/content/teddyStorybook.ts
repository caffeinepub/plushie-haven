/**
 * Teddy's Little Forest Adventure - A cute storybook for the gallery
 */

export interface StorybookContent {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  story: string;
}

export const teddyStorybook: StorybookContent = {
  id: 'storybook:teddy-forest-adventure',
  title: "Teddy's Little Forest Adventure",
  description: 'A heartwarming tale of a tiny brown bear who discovers a magical forest',
  coverImage: '/assets/generated/plushie-haven-teddy-bow-mark.dim_512x512.png',
  story: `Teddy was a tiny brown bear who lived on a soft pink pillow in a sunny bedroom. One morning, he rolled over, tumbled off the bed, and bounced straight into a sparkly hole that led to a friendly forest.

In the forest, Teddy met a giggling bunny, a sleepy owl, and a squirrel who wore a tiny hat. They helped Teddy pick blueberries, cross a wobbly log bridge, and chase shiny fireflies.

When the sun began to set, a warm breeze lifted Teddy back through the sparkly hole and placed him gently on his pillow. His fur smelled like blueberries, and he felt happy knowing he had new forest friends waiting for him tomorrow.`,
};

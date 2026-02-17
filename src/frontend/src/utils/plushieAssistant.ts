export interface SessionState {
  mode: 'idle' | 'recommendation' | 'story';
  recommendationStep?: number;
  preferences?: {
    size?: string;
    texture?: string;
    animalType?: string;
    budget?: string;
  };
  storyTheme?: string;
}

export interface QuickAction {
  label: string;
  prompt: string;
}

interface AssistantResponse {
  response: string;
  newSessionState: SessionState;
}

// Intent detection
function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('help me choose') || lower.includes('which plushie')) {
    return 'recommendation';
  }
  if (lower.includes('story') || lower.includes('tale') || lower.includes('tell me about')) {
    return 'story';
  }
  if (lower.includes('care') || lower.includes('clean') || lower.includes('wash') || lower.includes('maintain')) {
    return 'care';
  }
  if (lower.includes('fact') || lower.includes('history') || lower.includes('origin')) {
    return 'facts';
  }
  
  return 'general';
}

// Care tips responses
function getCareTips(): string {
  const tips = [
    "🧸 **Plushie Care Tips:**\n\n" +
    "• **Regular cleaning:** Spot clean with mild soap and water, or use a damp cloth for surface dirt.\n" +
    "• **Machine washing:** Place in a pillowcase or mesh bag on gentle cycle with cold water. Air dry only!\n" +
    "• **Fluffing:** Gently brush fur with a soft brush to restore fluffiness.\n" +
    "• **Storage:** Keep in a cool, dry place away from direct sunlight to prevent fading.\n" +
    "• **Repairs:** Sew up small tears promptly to prevent stuffing loss.\n\n" +
    "Remember, each plushie is special and may have unique care needs! Always check tags for specific instructions. 💕",
    
    "🧼 **Keeping Your Plushies Fresh:**\n\n" +
    "• **Deodorizing:** Sprinkle baking soda, let sit for 30 minutes, then vacuum or brush off.\n" +
    "• **Stain removal:** Blot (don't rub!) stains immediately with cold water and mild detergent.\n" +
    "• **Drying:** Never use a dryer! Air dry flat or hanging to maintain shape.\n" +
    "• **Delicate plushies:** For vintage or delicate friends, consider professional cleaning.\n" +
    "• **Love and attention:** Regular gentle handling keeps them feeling cherished! 🌟"
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

// Fun facts responses
function getFunFacts(): string {
  const facts = [
    "✨ **Plushie Fun Facts:**\n\n" +
    "• The teddy bear was named after President Theodore Roosevelt in 1902!\n" +
    "• The world's largest teddy bear measured over 63 feet tall.\n" +
    "• Studies show that cuddling plushies can reduce stress and anxiety in adults.\n" +
    "• Japan's 'kawaii' culture has made plushies a beloved part of adult life worldwide.\n" +
    "• Collecting plushies is called 'arctophily' - and it's a wonderful hobby! 🧸💕",
    
    "🌟 **More Plushie Magic:**\n\n" +
    "• The first stuffed toy was created in Germany in the 1880s.\n" +
    "• Plushies can help with emotional regulation and provide comfort during difficult times.\n" +
    "• Many adults sleep with plushies - it's completely normal and healthy!\n" +
    "• The plushie industry is worth billions globally, with adult collectors driving growth.\n" +
    "• Each plushie has its own personality - that's what makes them so special! 💖"
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
}

// Recommendation flow
function handleRecommendation(message: string, state: SessionState): AssistantResponse {
  const step = state.recommendationStep || 0;
  const prefs = state.preferences || {};
  
  if (step === 0) {
    return {
      response: "I'd love to help you find the perfect plushie! 🧸✨\n\nLet's start with size - what are you looking for?\n\n• **Small** (palm-sized, portable)\n• **Medium** (huggable, desk-friendly)\n• **Large** (big cuddle buddy)\n• **Extra Large** (life-sized companion)\n\nJust tell me which size appeals to you!",
      newSessionState: { mode: 'recommendation', recommendationStep: 1, preferences: prefs }
    };
  }
  
  if (step === 1) {
    const lower = message.toLowerCase();
    let size = 'medium';
    if (lower.includes('small') || lower.includes('tiny') || lower.includes('palm')) size = 'small';
    else if (lower.includes('large') || lower.includes('big') || lower.includes('huge')) size = 'large';
    else if (lower.includes('extra') || lower.includes('life')) size = 'extra large';
    
    prefs.size = size;
    
    return {
      response: `Great choice! A ${size} plushie sounds perfect. 💕\n\nNow, what texture do you prefer?\n\n• **Super soft** (minky, velour)\n• **Fluffy** (long fur, cloud-like)\n• **Smooth** (short pile, sleek)\n• **Textured** (corduroy, knit)\n\nWhat feels most comforting to you?`,
      newSessionState: { mode: 'recommendation', recommendationStep: 2, preferences: prefs }
    };
  }
  
  if (step === 2) {
    const lower = message.toLowerCase();
    let texture = 'soft';
    if (lower.includes('fluffy') || lower.includes('fur')) texture = 'fluffy';
    else if (lower.includes('smooth') || lower.includes('sleek')) texture = 'smooth';
    else if (lower.includes('texture') || lower.includes('knit')) texture = 'textured';
    
    prefs.texture = texture;
    
    // Generate recommendations
    const recommendations = generateRecommendations(prefs);
    
    return {
      response: recommendations,
      newSessionState: { mode: 'idle' }
    };
  }
  
  return {
    response: "Let me help you find the perfect plushie! What size are you looking for?",
    newSessionState: { mode: 'recommendation', recommendationStep: 1, preferences: {} }
  };
}

function generateRecommendations(prefs: any): string {
  const { size = 'medium', texture = 'soft' } = prefs;
  
  let recs = `🎯 **Perfect Plushie Recommendations for You:**\n\nBased on your preferences (${size}, ${texture}), here are some wonderful options:\n\n`;
  
  if (size === 'small' && texture === 'soft') {
    recs += "• **Jellycat Bashful Bunny** - Ultra-soft, pocket-sized comfort\n";
    recs += "• **Squishmallow 5-inch** - Marshmallow-soft and collectible\n";
    recs += "• **Ty Beanie Boos Mini** - Adorable with sparkly eyes\n";
  } else if (size === 'large' && texture === 'fluffy') {
    recs += "• **Giant Teddy Bear** - Classic, fluffy, perfect for big hugs\n";
    recs += "• **Melissa & Doug Jumbo Plush** - High-quality, super cuddly\n";
    recs += "• **Aurora World Flopsie** - Floppy, fluffy, and lovable\n";
  } else if (texture === 'smooth') {
    recs += "• **Jellycat Amuseable Collection** - Smooth, quirky designs\n";
    recs += "• **GUND Snuffles Bear** - Silky-soft classic teddy\n";
    recs += "• **Steiff Soft Cuddly Friends** - Premium smooth plush\n";
  } else {
    recs += "• **Squishmallow 12-inch** - Perfectly huggable and soft\n";
    recs += "• **GUND Philbin Bear** - Timeless, cozy companion\n";
    recs += "• **Jellycat Bashful Collection** - Luxuriously soft and cuddly\n";
  }
  
  recs += "\n💡 **Tip:** Visit specialty toy stores or online retailers like Jellycat.com, Amazon, or local plushie boutiques to find these treasures!\n\n";
  recs += "Would you like more recommendations or have other questions? I'm here to help! 🌟";
  
  return recs;
}

// Story generation
function handleStory(message: string, state: SessionState): AssistantResponse {
  const lower = message.toLowerCase();
  
  // Check if user provided a theme/character
  let theme = state.storyTheme;
  if (!theme) {
    // Try to extract theme from message
    if (lower.includes('bear') || lower.includes('teddy')) theme = 'bear';
    else if (lower.includes('bunny') || lower.includes('rabbit')) theme = 'bunny';
    else if (lower.includes('cat') || lower.includes('kitty')) theme = 'cat';
    else if (lower.includes('dog') || lower.includes('puppy')) theme = 'dog';
    else theme = 'bear'; // default
  }
  
  const story = generateStory(theme);
  
  return {
    response: story,
    newSessionState: { mode: 'idle' }
  };
}

function generateStory(theme: string): string {
  const stories: Record<string, string[]> = {
    bear: [
      "📖 **The Cozy Corner Adventure**\n\n" +
      "Once upon a time, in a sunlit corner of a cozy apartment, lived a gentle teddy bear named Honey. Honey had the softest caramel fur and wore a tiny blue bow tie that sparkled in the morning light.\n\n" +
      "Every day, Honey would sit on the reading chair, watching the world go by through the window. But Honey's favorite time was evening, when their human would come home, tired from the day. Honey would be there, ready with silent comfort and the warmest hugs.\n\n" +
      "One particularly difficult day, Honey's human sat down and held them close. 'Thank you for always being here,' they whispered. Honey couldn't speak, but their presence said everything: 'I'll always be your safe place.'\n\n" +
      "And so, Honey continued their quiet mission - being a beacon of comfort, one hug at a time. Because that's what plushies do best: they remind us that we're never truly alone. 🧸💕\n\n" +
      "**The End**\n\nWould you like another story or have any questions?",
      
      "📖 **Teddy's Tea Party**\n\n" +
      "In a cheerful bedroom filled with soft pillows and twinkling fairy lights, a distinguished teddy bear named Sir Fluffington hosted the most wonderful tea parties.\n\n" +
      "Every Sunday afternoon, Sir Fluffington would arrange his friends in a circle - a bunny, a elephant, and a wise old owl plushie. Together, they'd have imaginary tea and share stories of comfort and joy.\n\n" +
      "Sir Fluffington believed that every plushie had an important job: to bring smiles and peace to their humans. 'We may be stuffed with fluff,' he'd say, 'but our hearts are filled with love.'\n\n" +
      "One day, their human had a breakthrough at work and rushed home to share the news. Sir Fluffington sat proudly on the bed, as if to say, 'I knew you could do it!' That night, the human fell asleep with Sir Fluffington in their arms, grateful for such a loyal friend.\n\n" +
      "And the tea parties continued, a reminder that joy can be found in the simplest moments. 🫖✨\n\n" +
      "**The End**\n\nWant to hear more stories?"
    ],
    bunny: [
      "📖 **Cottontail's Garden Dream**\n\n" +
      "In a basket beside a sunny window lived Cottontail, a floppy-eared bunny with the softest white fur and a pink button nose.\n\n" +
      "Cottontail loved to dream about gardens - fields of wildflowers, patches of clover, and the gentle buzz of bumblebees. Though Cottontail couldn't hop through real gardens, they brought the feeling of spring to their human every single day.\n\n" +
      "When their human felt stressed, they'd hold Cottontail close and imagine that peaceful garden together. The soft fur felt like flower petals, and somehow, worries would melt away.\n\n" +
      "'You're my little piece of peace,' the human would say. And Cottontail, in their quiet bunny way, would seem to smile, knowing they were doing exactly what they were meant to do.\n\n" +
      "Together, they proved that comfort doesn't need words - sometimes, it just needs soft ears and a gentle presence. 🌸🐰\n\n" +
      "**The End**\n\nShall I tell you another tale?"
    ],
    cat: [
      "📖 **Whiskers' Moonlight Watch**\n\n" +
      "On a shelf overlooking a cozy bed sat Whiskers, a plush cat with gray stripes and bright green button eyes that seemed to sparkle with wisdom.\n\n" +
      "Whiskers had a special job: keeping watch during the night. While their human slept, Whiskers would 'guard' against bad dreams and lonely thoughts, a silent sentinel of comfort.\n\n" +
      "One restless night, the human woke from a nightmare and reached for Whiskers. The soft, familiar texture and gentle weight brought instant calm. 'You're always here when I need you,' they whispered.\n\n" +
      "Whiskers couldn't purr like a real cat, but their presence was just as soothing. They reminded their human that even in the darkest nights, there's always something soft and safe to hold onto.\n\n" +
      "And so Whiskers continued their moonlight watch, a faithful friend through every night. 🌙😺\n\n" +
      "**The End**\n\nWould you like to hear more?"
    ],
    dog: [
      "📖 **Buddy's Forever Promise**\n\n" +
      "In a sunny living room, on the corner of a well-loved couch, sat Buddy - a golden plush puppy with floppy ears and a red collar.\n\n" +
      "Buddy had been a gift during a difficult time, and from the first moment, they became an irreplaceable companion. Unlike real dogs, Buddy never needed walks or food, but they gave something just as valuable: unconditional presence.\n\n" +
      "Through job changes, moves, and life's ups and downs, Buddy was there. Their human would sometimes laugh and say, 'You're the most loyal friend I've ever had.'\n\n" +
      "Buddy couldn't wag their tail or bark, but their soft, constant presence spoke volumes: 'I'm here. Always. No matter what.'\n\n" +
      "And that promise - that simple, beautiful promise of always being there - made Buddy more than just a plushie. They were family. 🐕💛\n\n" +
      "**The End**\n\nAnything else I can help you with?"
    ]
  };
  
  const themeStories = stories[theme] || stories.bear;
  return themeStories[Math.floor(Math.random() * themeStories.length)];
}

// General conversation
function getGeneralResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello there! 🧸✨ I'm your Plushie Pal, here to chat about all things cozy and cuddly! Whether you need care tips, recommendations, a story, or just want to talk about plushies, I'm here for you. What would you like to know?";
  }
  
  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're so welcome! 💕 I'm always happy to help fellow plushie lovers. Feel free to ask me anything else - I'm here whenever you need me! 🌟";
  }
  
  if (lower.includes('bye') || lower.includes('goodbye')) {
    return "Goodbye, friend! 🧸💕 Come back anytime you want to chat about plushies. Remember, your plushie friends are always there for you, and so am I! Take care! ✨";
  }
  
  const responses = [
    "That's interesting! 🧸 I'm here to help with plushie-related questions. Would you like to know about care tips, get recommendations, or hear a cozy story?",
    "I love chatting about plushies! 💕 I can help you with care advice, suggest the perfect plushie for you, share fun facts, or tell you a heartwarming story. What sounds good?",
    "As your Plushie Pal, I'm here to make your plushie journey even more wonderful! ✨ Ask me about care, recommendations, stories, or just share your love for plushies!",
    "Every plushie is special, just like you! 🌟 I'm here to help with anything plushie-related. What would you like to explore together?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Main message processor
export function processMessage(message: string, currentState: SessionState): AssistantResponse {
  // Handle ongoing flows
  if (currentState.mode === 'recommendation') {
    return handleRecommendation(message, currentState);
  }
  
  if (currentState.mode === 'story') {
    return handleStory(message, currentState);
  }
  
  // Detect new intent
  const intent = detectIntent(message);
  
  switch (intent) {
    case 'recommendation':
      return handleRecommendation(message, { mode: 'recommendation', recommendationStep: 0, preferences: {} });
    
    case 'story':
      return handleStory(message, { mode: 'story' });
    
    case 'care':
      return {
        response: getCareTips(),
        newSessionState: { mode: 'idle' }
      };
    
    case 'facts':
      return {
        response: getFunFacts(),
        newSessionState: { mode: 'idle' }
      };
    
    case 'general':
    default:
      return {
        response: getGeneralResponse(message),
        newSessionState: { mode: 'idle' }
      };
  }
}

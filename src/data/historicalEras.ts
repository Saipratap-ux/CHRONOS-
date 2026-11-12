import { HistoricalEra } from '../types';

export const HISTORICAL_ERAS: HistoricalEra[] = [
  {
    id: 'egypt',
    nameKey: 'era_egypt',
    defaultName: 'Ancient Egypt',
    year: '1340 BCE',
    location: 'Thebes & Giza, Nile River',
    period: 'New Kingdom 18th Dynasty',
    tagline: 'Golden Pharaohs, Lapis Lazuli & Sacred Pyramids',
    description: 'Walk in the radiant court of Akhenaten and Tutankhamun along the glistening Nile.',
    costume: 'Lapis lazuli and gold pectoral collar, pleated royal linen shendyt, golden uraeus falcon cobra crown, and kohl eyeliner.',
    promptTemplate: 'Photorealistic ancient Egyptian royal portrait, 1340 BCE Thebes, wearing heavy 24k gold and lapis lazuli collar, royal pleated white linen, warm golden desert sun rays, great pyramids and Nile papyrus reeds in background, sharp cinematic lighting.',
    color: {
      primary: '#eab308',
      secondary: '#ca8a04',
      accent: '#38bdf8',
      border: 'border-amber-400',
      bgGradient: 'from-amber-950 via-yellow-900 to-slate-950',
    },
    filter: 'vintage-sepia',
    funFact: 'Both men and women in Ancient Egypt wore green and black eye paint (kohl) not just for style, but to protect their eyes from the desert sun glare and infections!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="egyptSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#451a03"/><stop offset="50%" stop-color="#b45309"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
        <linearGradient id="pyrGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#egyptSky)"/>
      <circle cx="400" cy="220" r="140" fill="#fef08a" opacity="0.65"/>
      <polygon points="120,650 350,340 540,650" fill="url(#pyrGrad)"/>
      <polygon points="380,680 580,410 760,680" fill="#92400e" opacity="0.85"/>
      <rect y="640" width="800" height="360" fill="#78350f"/>
      <path d="M0,720 Q200,680 400,720 T800,720 L800,1000 L0,1000 Z" fill="#0284c7" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'renaissance',
    nameKey: 'era_renaissance',
    defaultName: 'Italian Renaissance',
    year: '1504 CE',
    location: 'Florence & Venice, Italy',
    period: 'High Renaissance Golden Age',
    tagline: 'Da Vinci Apprentices, Oil Masterpieces & Florence Duomo',
    description: 'Immerse yourself in the atelier of Leonardo da Vinci, Michelangelo, and Venetian masters.',
    costume: 'Heavy crimson or forest green velvet doublet, silk chemise with ruff collar, gold medallion chains, and soft feathered artist cap.',
    promptTemplate: 'High Renaissance oil painting master portrait, 1504 Florence, painted by Leonardo da Vinci and Raphael, chiaroscuro lighting, rich velvet robe with gold embroidery, sfumato soft edges, classical Tuscan villa and Florence Duomo hills in distance.',
    color: {
      primary: '#f97316',
      secondary: '#c2410c',
      accent: '#fbbf24',
      border: 'border-orange-400',
      bgGradient: 'from-orange-950 via-stone-900 to-slate-950',
    },
    filter: 'renaissance-oil',
    funFact: 'Leonardo da Vinci was left-handed and wrote all his notebooks backwards from right to left in mirror script!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="renSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="60%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#fdba74"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#renSky)"/>
      <path d="M0,600 Q200,520 400,580 T800,560 L800,1000 L0,1000 Z" fill="#292524"/>
      <circle cx="580" cy="510" r="45" fill="#ea580c"/>
      <polygon points="535,510 625,510 580,440" fill="#c2410c"/>
      <path d="M0,740 Q250,680 500,750 T800,720 L800,1000 L0,1000 Z" fill="#1c1917"/>
    </svg>`,
  },
  {
    id: 'japan',
    nameKey: 'era_japan',
    defaultName: 'Feudal Edo Japan',
    year: '1615 CE',
    location: 'Kyoto & Edo Castle, Japan',
    period: 'Tokugawa Shogunate',
    tagline: 'Honor, Sakura Cherry Blossoms & Silk Kimonos',
    description: 'Walk through lantern-lit bamboo groves and castle gardens of the samurai and tea masters.',
    costume: 'Hand-woven silk haori or ceremonial kimono with family crest mon, golden brocade obi sash, and ornate lacquered accessories.',
    promptTemplate: 'Atmospheric Feudal Japan 1615 portrait, traditional silk kimono and samurai haori robe, misty bamboo garden in Kyoto, falling cherry blossom petals, lantern glowing warmly in evening fog, ukiyo-e woodblock inspired cinematic elegance.',
    color: {
      primary: '#f43f5e',
      secondary: '#be123c',
      accent: '#fda4af',
      border: 'border-rose-400',
      bgGradient: 'from-rose-950 via-slate-900 to-stone-950',
    },
    filter: 'edo-wash',
    funFact: 'During the Edo period, Tokyo (then called Edo) grew into one of the largest and most vibrant cities in the world with over one million inhabitants!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="edoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#4c0519"/><stop offset="100%" stop-color="#ffe4e6"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#edoSky)"/>
      <circle cx="400" cy="300" r="160" fill="#e11d48" opacity="0.7"/>
      <polygon points="200,680 400,420 600,680" fill="#1e1b4b"/>
      <polygon points="240,680 400,450 560,680" fill="#f43f5e" opacity="0.3"/>
      <rect y="680" width="800" height="320" fill="#09090b"/>
    </svg>`,
  },
  {
    id: '1920s',
    nameKey: 'era_1920s',
    defaultName: 'Roaring Twenties',
    year: '1925 CE',
    location: 'Manhattan & Chicago Jazz Clubs',
    period: 'Jazz Age & Art Deco',
    tagline: 'Gatsby Soirées, Speakeasies & Champagne Towers',
    description: 'The golden age of jazz, fringe dresses, sharp pinstripe suits, and glittering midnight dances.',
    costume: 'Sparkling art deco beaded flapper dress with feather headband or sharp double-breasted tuxedo with silk bow tie and fedora.',
    promptTemplate: 'Glamorous Roaring 1920s jazz club portrait, 1925 Harlem and Manhattan speakeasy, glittering art deco gold geometric backdrop, crystal chandeliers, velvet seating, vintage Kodak black-and-gold sepia glamour aesthetic.',
    color: {
      primary: '#eab308',
      secondary: '#a16207',
      accent: '#fef08a',
      border: 'border-amber-300',
      bgGradient: 'from-yellow-950 via-zinc-900 to-black',
    },
    filter: 'technicolor',
    funFact: 'The Charleston dance craze in 1923 was so energetic that some ballroom floors had to be reinforced to withstand hundreds of simultaneous dancers!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jazzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000000"/><stop offset="50%" stop-color="#451a03"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#jazzSky)"/>
      <g stroke="#fef08a" stroke-width="2" opacity="0.4">
        <line x1="400" y1="0" x2="0" y2="1000"/>
        <line x1="400" y1="0" x2="800" y2="1000"/>
        <line x1="400" y1="0" x2="200" y2="1000"/>
        <line x1="400" y1="0" x2="600" y2="1000"/>
      </g>
      <circle cx="400" cy="200" r="80" stroke="#fef08a" stroke-width="4" fill="none"/>
    </svg>`,
  },
  {
    id: 'wildwest',
    nameKey: 'era_wildwest',
    defaultName: 'Wild West Frontier',
    year: '1878 CE',
    location: 'Tombstone, Arizona & Dodge City',
    period: 'American Frontier',
    tagline: 'Saloon Showdowns, Sheriffs & Canyon Sunsets',
    description: 'Ride the dusty frontier trail under blazing desert canyon sunsets with tin badges and Stetson hats.',
    costume: 'Weathered leather duster coat, felt Stetson hat, brass sheriff star badge, bandana neckerchief, and woven frontier vest.',
    promptTemplate: 'Authentic 1878 Wild West portrait, Tombstone saloon wooden boardwalk, dusty red rock mesas under burning crimson sunset, wearing leather cowboy duster and felt Stetson hat, tintype wet-plate photographic sepia style.',
    color: {
      primary: '#d97706',
      secondary: '#92400e',
      accent: '#fbbf24',
      border: 'border-amber-600',
      bgGradient: 'from-amber-950 via-stone-900 to-stone-950',
    },
    filter: 'vintage-sepia',
    funFact: 'Cowboys rarely wore the gigantic ten-gallon hats seen in movies; bowler hats and flat-brimmed felt caps were actually far more common on the frontier!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="westSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c2d12"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#westSky)"/>
      <circle cx="400" cy="380" r="120" fill="#fef08a" opacity="0.8"/>
      <rect x="80" y="550" width="160" height="180" fill="#78350f"/>
      <rect x="520" y="520" width="200" height="210" fill="#78350f"/>
      <rect y="700" width="800" height="300" fill="#451a03"/>
    </svg>`,
  },
  {
    id: 'space',
    nameKey: 'era_space',
    defaultName: 'Apollo Space Age',
    year: '1969 CE',
    location: 'Sea of Tranquility, Moon',
    period: 'Apollo Lunar Exploration',
    tagline: 'One Giant Leap, Lunar Horizons & Silver Helmets',
    description: 'Stand upon the pristine lunar dust gazing back at the glowing blue marble of Earth in the black void.',
    costume: 'NASA Apollo A7L space suit with golden visor helmet reflection, red mission commander stripes, and chest life-support pack.',
    promptTemplate: 'Historic Apollo 11 moon landing portrait, July 1969, wearing white NASA Apollo astronaut suit with gold reflective helmet visor, Earth shining blue in deep starry black space, Hasselblad 70mm medium-format film aesthetic.',
    color: {
      primary: '#38bdf8',
      secondary: '#0284c7',
      accent: '#e0f2fe',
      border: 'border-sky-400',
      bgGradient: 'from-slate-950 via-blue-950 to-black',
    },
    filter: 'lunar-bw',
    funFact: 'Astronaut footprints made during the Apollo missions will remain intact on the Moon for millions of years because there is no wind or liquid water to erode them!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1000" fill="#020617"/>
      <!-- Earth -->
      <circle cx="620" cy="220" r="70" fill="#0284c7"/>
      <circle cx="600" cy="205" r="30" fill="#22c55e" opacity="0.7"/>
      <path d="M0,720 Q300,660 600,740 T800,720 L800,1000 L0,1000 Z" fill="#64748b"/>
      <ellipse cx="250" cy="800" rx="90" ry="30" fill="#475569"/>
    </svg>`,
  },
  {
    id: 'victorian',
    nameKey: 'era_victorian',
    defaultName: 'Victorian Steampunk',
    year: '1888 CE',
    location: 'London & Industrial Thames',
    period: 'Late Victorian & Brass Steam Age',
    tagline: 'Gaslamps, Clockwork Cogs, Monocles & Velvet',
    description: 'Cobblestone streets shrouded in river fog, steam locomotives, brass chronometers, and grand tea parlors.',
    costume: 'Tailored tweed frock coat, silk ascot, brass-rimmed spectacle monocle, top hat with gear accents, and pocket watch on chain.',
    promptTemplate: 'Atmospheric 1888 Victorian London steampunk portrait, foggy cobblestone street by Big Ben gaslamps, wearing brass-fitted wool trench coat and polished leather boots, vintage daguerreotype sepia tone with rich details.',
    color: {
      primary: '#a855f7',
      secondary: '#7e22ce',
      accent: '#e9d5ff',
      border: 'border-purple-400',
      bgGradient: 'from-purple-950 via-stone-900 to-slate-950',
    },
    filter: 'steampunk',
    funFact: 'Big Ben refers technically to the massive 13.7-tonne bell inside the clock tower, rather than the clock or tower itself!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vicSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="60%" stop-color="#3b0764"/><stop offset="100%" stop-color="#701a75"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#vicSky)"/>
      <rect x="520" y="240" width="80" height="520" fill="#18181b"/>
      <circle cx="560" cy="300" r="28" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
      <rect y="760" width="800" height="240" fill="#09090b"/>
    </svg>`,
  },
  {
    id: 'medieval',
    nameKey: 'era_medieval',
    defaultName: 'Medieval Knight & Court',
    year: '1215 CE',
    location: 'Nottingham & Camelot Castle',
    period: 'High Middle Ages',
    tagline: 'Shining Plate Armor, Royal Banners & Chivalry',
    description: 'Hear the trumpet fanfares across castle courtyards as knights clash under heraldic banners.',
    costume: 'Polished steel chainmail and knightly breastplate with royal lion crest, velvet tabard tunic, and broadsword scabbard.',
    promptTemplate: 'Heroic 1215 medieval knight royal portrait, stone castle throne room with gothic arched stained-glass windows, wearing gleaming steel armor with embroidered lion heraldry tabard, dramatic warm torchlight flare.',
    color: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#a7f3d0',
      border: 'border-emerald-400',
      bgGradient: 'from-emerald-950 via-slate-900 to-stone-950',
    },
    filter: 'medieval-tapestry',
    funFact: 'A full suit of medieval plate armor weighed between 20 to 25 kg (45-55 lbs), which was so well distributed over the body that a trained knight could run and mount a horse without assistance!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1000" fill="#0f172a"/>
      <!-- Castle turrets -->
      <rect x="150" y="420" width="100" height="380" fill="#334155"/>
      <polygon points="130,420 200,320 270,420" fill="#047857"/>
      <rect x="550" y="420" width="100" height="380" fill="#334155"/>
      <polygon points="530,420 600,320 670,420" fill="#047857"/>
      <rect x="250" y="520" width="300" height="280" fill="#1e293b"/>
      <path d="M350,800 A50,50 0 0,1 450,800 Z" fill="#020617"/>
    </svg>`,
  },
  {
    id: 'paris1900',
    nameKey: 'era_paris1900',
    defaultName: 'Belle Époque Paris',
    year: '1900 CE',
    location: 'Montmartre & Eiffel Tower, Paris',
    period: 'The Beautiful Era',
    tagline: 'Impressionist Cafés, Eiffel Lights & Bohemian Art',
    description: 'Sip café au lait along the Seine during the 1900 World Exposition in glowing Paris.',
    costume: 'Elegantly tailored silk evening gown with lace embroidery or dapper Parisian charcoal suit with silk cravat and cane.',
    promptTemplate: 'Enchanting 1900 Belle Époque Paris portrait, outdoor Montmartre café beside the Seine River, glowing Eiffel Tower in background, warm afternoon sun filtering through chestnut trees, Impressionist Monet-inspired painting style.',
    color: {
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#fbcfe8',
      border: 'border-pink-400',
      bgGradient: 'from-pink-950 via-slate-900 to-stone-950',
    },
    filter: 'renaissance-oil',
    funFact: 'Over 50 million visitors attended the 1900 Paris World Fair, celebrating electricity, cinema, and moving walkways!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="parisSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a044e"/><stop offset="60%" stop-color="#db2777"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#parisSky)"/>
      <!-- Eiffel Tower silhouette -->
      <polygon points="390,200 410,200 440,700 360,700" fill="#18181b"/>
      <rect y="700" width="800" height="300" fill="#09090b"/>
    </svg>`,
  },
  {
    id: 'cyber2099',
    nameKey: 'era_cyber2099',
    defaultName: 'Neo-Tokyo 2099',
    year: '2099 CE',
    location: 'Neo-Shinjuku Skyward Citadel',
    period: 'Future Cyber-Chronos',
    tagline: 'Holographic Neon, Flying Speeders & Quantum Agility',
    description: 'Leap ahead into the high-tech future as a Temporal Enforcement Agent defending the spacetime continuum.',
    costume: 'Glow-wire cyberpunk tactical trench jacket, neural interface temple augment, cyan HUD visor, and carbon-fiber plating.',
    promptTemplate: 'Futuristic Neo-Tokyo 2099 cyberpunk portrait, towering neon holograms in rainy reflection, glowing cyan HUD visor and cybernetic chrome implants, dark high-tech street photography aesthetic.',
    color: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#a5f3fc',
      border: 'border-cyan-400',
      bgGradient: 'from-cyan-950 via-indigo-950 to-slate-950',
    },
    filter: 'cyber-neon',
    funFact: 'In theoretical physics, Kip Thorne and modern scientists have modeled traversable wormholes as potential solutions to Einstein’s field equations!',
    svgScene: `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1000" fill="#020617"/>
      <rect x="80" y="320" width="140" height="680" fill="#0f172a" stroke="#06b6d4" stroke-width="2"/>
      <rect x="280" y="240" width="180" height="760" fill="#1e1b4b" stroke="#ec4899" stroke-width="2"/>
      <rect x="520" y="360" width="160" height="640" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="370" cy="160" r="60" fill="none" stroke="#06b6d4" stroke-width="6"/>
    </svg>`,
  },
];

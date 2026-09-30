import { SpeciesInfo } from '../types/marine';

export const SPECIES_DATA: Record<string, SpeciesInfo> = {
  clownfish: {
    id: 'clownfish',
    commonName: 'Ocellaris Clownfish',
    scientificName: 'Amphiprion ocellaris',
    depthZone: 'Shallow Lagoons & Reefs (1–15m)',
    description:
      'Famous for their symbiotic bond with sea anemones, clownfish possess a protective mucus coat that shields them from the stinging tentacles of their host anemone.',
    diet: 'Algae, plankton, copepods, anemone leftovers',
    lifespan: '6–10 years in the wild',
    accentColor: '#fb923c',
  },
  blue_tang: {
    id: 'blue_tang',
    commonName: 'Blue Surgeonfish',
    scientificName: 'Paracanthurus hepatus',
    depthZone: 'Coral Reef Slopes (2–40m)',
    description:
      'Recognized by its royal blue body, signature black palette curve, and canary yellow tail. Possesses a razor-sharp venomous caudal spine used for reef defense.',
    diet: 'Marine macroalgae, filamentous algae',
    lifespan: '12–20 years',
    accentColor: '#38bdf8',
  },
  goldfish: {
    id: 'goldfish',
    commonName: 'Ryukin Ornamental Carassius',
    scientificName: 'Carassius auratus',
    depthZone: 'Temperate & Freshwater Habitats',
    description:
      'Celebrated for its billowing, silk-like double caudal fin and pearlescent scales that catch refracted sunlight like molten gold.',
    diet: 'Omnivorous; aquatic plants, insects, detritus',
    lifespan: '10–15 years',
    accentColor: '#f59e0b',
  },
  angelfish: {
    id: 'angelfish',
    commonName: 'Emperor Freshwater Angelfish',
    scientificName: 'Pterophyllum scalare',
    depthZone: 'Calm River Basins & Reef Shelves',
    description:
      'Possesses laterally compressed diamond silhouettes with regal elongated dorsal and anal streamers that stabilize its graceful vertical gliding movements.',
    diet: 'Small crustaceans, worms, aquatic insects',
    lifespan: '8–12 years',
    accentColor: '#e0e7ff',
  },
  tropical_chromis: {
    id: 'tropical_chromis',
    commonName: 'Blue-Green Chromis',
    scientificName: 'Chromis viridis',
    depthZone: 'Branching Coral Beds (1–12m)',
    description:
      'A brilliant schooling damselfish with shimmering iridescent aqua-cyan hues that retreat instantaneously into acropora coral branches when startled.',
    diet: 'Zooplankton, phytoplankton',
    lifespan: '4–6 years',
    accentColor: '#2dd4bf',
  },
  school_fish: {
    id: 'school_fish',
    commonName: 'Silver Anchoveta / Baitfish',
    scientificName: 'Engraulis ringens',
    depthZone: 'Pelagic & Coastal Neritic Waters',
    description:
      'Exhibits synchronized shoaling physics, synchronizing speed and heading through lateral line pressure sensation to confuse apex predators.',
    diet: 'Marine plankton, micro-algae',
    lifespan: '3–4 years',
    accentColor: '#93c5fd',
  },
  sea_turtle: {
    id: 'sea_turtle',
    commonName: 'Green Sea Turtle',
    scientificName: 'Chelonia mydas',
    depthZone: 'Open Pelagic & Seagrass Meadows (0–100m)',
    description:
      'Ancient marine reptiles navigating oceanic currents using geomagnetic fields. Their streamlined hydrodynamic carapace allows them to glide effortlessly across reef channels.',
    diet: 'Seagrasses, seaweeds, mangrove leaves',
    lifespan: '70–80+ years',
    accentColor: '#34d399',
  },
  jellyfish: {
    id: 'jellyfish',
    commonName: 'Moon Jellyfish',
    scientificName: 'Aurelia aurita',
    depthZone: 'Epipelagic & Mesopelagic (0–1000m)',
    description:
      'Composed of 95% water, moon jellies propel themselves through rhythmic coronal muscle contractions. In abyssal darkness, they emit faint bioluminescence.',
    diet: 'Microscopic plankton, mollusks, fish eggs',
    lifespan: '6–12 months',
    accentColor: '#c084fc',
  },
  stingray: {
    id: 'stingray',
    commonName: 'Spotted Eagle Ray',
    scientificName: 'Aetobatus narinari',
    depthZone: 'Coral Reefs & Open Lagoons (1–80m)',
    description:
      'An extraordinarily graceful cartilaginous elasmobranch with broad pectoral wings that undulate through the water column resembling underwater flight.',
    diet: 'Clams, oysters, crabs, sea urchins',
    lifespan: '15–20 years',
    accentColor: '#a5f3fc',
  },
  shark_silhouette: {
    id: 'shark_silhouette',
    commonName: 'Blacktip Reef Shark',
    scientificName: 'Carcharhinus melanopterus',
    depthZone: 'Reef Drop-Offs & Lagoons (0–75m)',
    description:
      'A sleek, timid apex reef hunter that patrols the edge of the coral drop-off, maintaining the healthy balance of reef fish populations.',
    diet: 'Reef fish, cephalopods, crustaceans',
    lifespan: '13–15 years',
    accentColor: '#64748b',
  },
  whale_silhouette: {
    id: 'whale_silhouette',
    commonName: 'Humpback Whale',
    scientificName: 'Megaptera novaeangliae',
    depthZone: 'Deep Ocean & Migration Channels',
    description:
      'A colossal baleen whale whose songs resonate across hundreds of oceanic miles. Rare glimpses in deep haze remind us of the vastness of the sea.',
    diet: 'Krill, small schooling fish',
    lifespan: '80–90 years',
    accentColor: '#3b82f6',
  },
  reef_crab: {
    id: 'reef_crab',
    commonName: 'Sally Lightfoot Reef Crab',
    scientificName: 'Grapsus grapsus',
    depthZone: 'Seabed Dunes & Rocky Outcrops (0–40m)',
    description:
      'A nimble benthic decapod that scuttles sideways across the sandy seabed and coral boulders. Highly adapted with serrated chelae to groom algae off reef rocks.',
    diet: 'Algae, detritus, mollusks, organic sediment',
    lifespan: '4–8 years',
    accentColor: '#ea580c',
  },
};

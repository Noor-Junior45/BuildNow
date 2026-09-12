/**
 * Category Helper: Strictly isolates Electrical Equipment and Construction Materials
 * Ensures zero overlap:
 * - Electrical page only shows Electrical products.
 * - Construction page only shows Construction materials.
 */

// Construction subcategories / identifiers
const CONSTRUCTION_SUBCATS = [
  'cement & concrete',
  'cement',
  'concrete',
  'tmt & steel',
  'tmt',
  'steel',
  'rebar',
  'tiling & adhesives',
  'tiling',
  'tile adhesive',
  'tile cleaner',
  'paints & putty',
  'paints',
  'paint',
  'putty',
  'primer',
  'waterproofing',
  'plywood & boards',
  'plywood',
  'ply',
  'board',
  'hdhmr',
  'adhesives & fevicol',
  'adhesive',
  'fevicol',
  'kitchen sinks & faucets',
  'kitchen sink',
  'sink',
  'faucet',
  'tap',
  'sanitary & bath fittings',
  'sanitary',
  'bath fitting',
  'commode',
  'toilet',
  'cistern',
  'hinges & hardware',
  'hinge',
  'drawer channel',
  'kitchen systems & accessories',
  'spice rack',
  'wardrobe & bed fittings',
  'bed fitting',
  'door locks & hardware',
  'door lock',
  'padlock',
  'plumbing & pipes',
  'plumbing',
  'cpvc',
  'upvc',
  'water storage tank',
  'power tools',
  'angle grinder',
  'impact drill',
  'drill kit',
  'general hardware & tools',
  'general hardware',
  'tarpaulin',
  'step ladder'
];

const CONSTRUCTION_BRANDS = [
  'ultratech',
  'acc',
  'ambuja',
  'tata tiscon',
  'shyam steel',
  'roff',
  'asian paints',
  'berger',
  'nerolac',
  'dr. fixit',
  'dr fixit',
  'centuryply',
  'action tesa',
  'greenply',
  'fevicol',
  'jaquar',
  'hindware',
  'cera',
  'geberit',
  'hettich',
  'astral',
  'supreme',
  'bosch'
];

// Electrical subcategories / identifiers
const ELECTRICAL_SUBCATS = [
  'wiring',
  'wire',
  'cable',
  'cables',
  'fans',
  'fan',
  'ceiling fan',
  'exhaust fan',
  'switches',
  'switch',
  'socket',
  'fan regulator',
  'regulator',
  'mcbs',
  'mcb',
  'distribution board',
  'db',
  'rccb',
  'isolator',
  'lights',
  'light',
  'led',
  'bulb',
  'floodlight',
  'panel light',
  'pvc items',
  'pvc conduit',
  'conduit pipe',
  'dalda pipe',
  'gi box',
  'modular box',
  'cctv & surveillance',
  'cctv',
  'surveillance',
  'security camera',
  'camera',
  'dvr',
  'nvr',
  'home appliances',
  'geyser',
  'water heater',
  'inverter',
  'home inverter'
];

const ELECTRICAL_BRANDS = [
  'rr kabel',
  'polycab',
  'finolex',
  'havells',
  'crompton',
  'atomberg',
  'schneider',
  'schneider electric',
  'anchor',
  'legrand',
  'philips',
  'wipro',
  'hikvision',
  'cp plus',
  'luminous',
  'syska',
  'orient',
  'bajaj',
  'usha'
];

/**
 * Checks if a product or raw database row belongs to Construction.
 */
export function isConstructionProduct(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  const id = String(item.id || '').trim();
  const cat = String(item.category || '').toLowerCase().trim();
  const sub = String(item.subcategory || item.subCategory || item.sub_category || '').toLowerCase().trim();
  const name = String(item.name || '').toLowerCase().trim();
  const brand = String(item.brand || '').toLowerCase().trim();

  // Known construction ID pattern
  if (id.startsWith('c') && !id.startsWith('cctv') && (id.startsWith('c-') || id === 'c1' || id === 'c2' || id === 'c3' || id === 'c4' || id === 'c5' || id === 'c6')) {
    return true;
  }

  // Explicit category check
  if (
    cat === 'construction' ||
    cat === 'cement' ||
    cat === 'steel' ||
    cat === 'tmt' ||
    cat === 'plumbing' ||
    cat === 'paint' ||
    cat === 'paints' ||
    cat === 'hardware' ||
    cat === 'tiling' ||
    cat === 'sanitary' ||
    cat === 'plywood' ||
    cat === 'waterproofing' ||
    cat === 'adhesive' ||
    cat === 'adhesives' ||
    cat.includes('construct') ||
    cat.includes('building') ||
    cat.includes('civil')
  ) {
    return true;
  }

  // Pure electrical category cannot be construction
  if (cat === 'electrical' || cat === 'electronics' || cat === 'lighting' || cat === 'wiring') {
    return false;
  }

  // Check construction subcategories
  if (sub) {
    for (const s of CONSTRUCTION_SUBCATS) {
      if (sub.includes(s) || (sub.length >= 3 && s.includes(sub))) {
        return true;
      }
    }
  }

  // Check construction brands (if not electrical)
  if (brand) {
    for (const b of CONSTRUCTION_BRANDS) {
      if (brand.includes(b) || (brand.length >= 3 && b.includes(brand))) {
        return true;
      }
    }
  }

  // Check specific construction terms in product name
  if (name) {
    if (
      name.includes('cement') ||
      name.includes('tmt rebar') ||
      name.includes('superlinks') ||
      name.includes('tile adhesive') ||
      name.includes('cera clean') ||
      name.includes('wall putty') ||
      name.includes('exterior emulsion') ||
      name.includes('interior emulsion') ||
      name.includes('waterproofing compound') ||
      name.includes('dampguard') ||
      name.includes('bwp plywood') ||
      name.includes('hdhmr board') ||
      name.includes('wood adhesive') ||
      name.includes('kitchen sink') ||
      name.includes('swan neck') ||
      name.includes('western commode') ||
      name.includes('concealed cistern') ||
      name.includes('auto hinges') ||
      name.includes('drawer channels') ||
      name.includes('spice rack') ||
      name.includes('bed lift mechanism') ||
      name.includes('digital door lock') ||
      name.includes('padlock') ||
      name.includes('cpvc pro') ||
      name.includes('water storage tank') ||
      name.includes('impact drill') ||
      name.includes('angle grinder') ||
      name.includes('step ladder') ||
      name.includes('tarpaulin sheet')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a product or raw database row belongs to Electrical.
 */
export function isElectricalProduct(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  // Strict check: If it's a construction product, it CANNOT be electrical
  if (isConstructionProduct(item)) {
    return false;
  }

  const id = String(item.id || '').trim();
  const cat = String(item.category || '').toLowerCase().trim();
  const sub = String(item.subcategory || item.subCategory || item.sub_category || '').toLowerCase().trim();
  const name = String(item.name || '').toLowerCase().trim();
  const brand = String(item.brand || '').toLowerCase().trim();

  // Known electrical ID patterns (p1, p2, p-fan-*, p-sw-*, p-mcb-*, p-light-*, p-dalda-*, p-gi-*, p-cctv-*, p-app-*)
  if (id.startsWith('p') || id.startsWith('elec')) {
    return true;
  }

  // Explicit electrical categories
  if (cat === 'electrical' || cat === 'electronics' || cat === 'lighting' || cat === 'wiring') {
    return true;
  }

  // Electrical subcategories
  if (sub) {
    for (const s of ELECTRICAL_SUBCATS) {
      if (sub.includes(s) || (sub.length >= 3 && s.includes(sub))) {
        return true;
      }
    }
  }

  // Electrical brands
  if (brand) {
    for (const b of ELECTRICAL_BRANDS) {
      if (brand.includes(b) || (brand.length >= 3 && b.includes(brand))) {
        return true;
      }
    }
  }

  // Check electrical product names
  if (name) {
    if (
      name.includes('wire') ||
      name.includes('cable') ||
      name.includes('fan') ||
      name.includes('switch') ||
      name.includes('socket') ||
      name.includes('regulator') ||
      name.includes('mcb') ||
      name.includes('distribution board') ||
      name.includes('led bulb') ||
      name.includes('panel light') ||
      name.includes('floodlight') ||
      name.includes('conduit pipe') ||
      name.includes('dalda') ||
      name.includes('gi box') ||
      name.includes('security camera') ||
      name.includes('dvr') ||
      name.includes('water heater') ||
      name.includes('geyser') ||
      name.includes('inverter')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Strictly classifies a product as either 'electrical' or 'construction'
 */
export function getProductCategory(item: any): 'electrical' | 'construction' {
  if (isConstructionProduct(item)) {
    return 'construction';
  }
  return 'electrical';
}

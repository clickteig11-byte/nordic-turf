import React, { useState, useId } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Sliders, 
  Gauge, 
  Droplets, 
  Sprout, 
  ShieldCheck, 
  Layers, 
  PhoneCall, 
  Sparkles,
  Info,
  Calendar,
  Compass
} from 'lucide-react';

interface SoilTextureSpec {
  name: string;
  bulkDensity: number; // g/cm³
  defaultCec: number; // meq/100g
  infiltrationRate: string; // in/hr
  waterHolding: string;
}

const SOIL_TEXTURES: Record<string, SoilTextureSpec> = {
  sandy_loam: {
    name: 'Coastal Sandy Loam',
    bulkDensity: 1.45,
    defaultCec: 9,
    infiltrationRate: '1.20 in/hr (Fast Drainage)',
    waterHolding: '1.1 in/ft of root depth'
  },
  fine_loam: {
    name: 'Glacial Silt Loam',
    bulkDensity: 1.30,
    defaultCec: 18,
    infiltrationRate: '0.65 in/hr (Balanced)',
    waterHolding: '2.0 in/ft of root depth'
  },
  marine_clay: {
    name: 'Heavy Marine Clay',
    bulkDensity: 1.15,
    defaultCec: 28,
    infiltrationRate: '0.15 in/hr (Compacted/Slow)',
    waterHolding: '2.4 in/ft of root depth'
  },
  engineered_sand: {
    name: 'USGA Engineered Sand Cap',
    bulkDensity: 1.55,
    defaultCec: 5,
    infiltrationRate: '14.0 in/hr (Ultra-Rapid)',
    waterHolding: '0.6 in/ft of root depth'
  }
};

interface TreatmentCadence {
  season: string;
  timing: string;
  target: string;
  soilTemp: string;
  protocol: string;
  biologicalInput: string;
}

const ANNUAL_CADENCE: TreatmentCadence[] = [
  {
    season: 'Early Spring',
    timing: 'Late March – April',
    target: 'Root Awakening & Awakening Pre-Emergent',
    soilTemp: '50°F – 55°F at 2" Depth',
    protocol: 'Microbial humate soil drench + organic corn gluten protein layer to suppress crabgrass germination without killing clover.',
    biologicalInput: 'Liquid Cold-Water Kelp (Ascophyllum nodosum) + Fulvic Acid Chelate'
  },
  {
    season: 'Late Spring',
    timing: 'May – Early June',
    target: 'Tiller Density & Deep Mycorrhizal Colonization',
    soilTemp: '60°F – 68°F at 2" Depth',
    protocol: 'First bench cut with Toro 11-blade reel mowers at 0.350". Deep solid-tine aeration down to 8" to drive oxygen into the rhizosphere.',
    biologicalInput: 'Endo/Ecto Mycorrhizae Spores + Brewer Yeast Bio-Stimulant'
  },
  {
    season: 'Mid Summer',
    timing: 'July – August',
    target: 'Drought Defense & Crown Protection',
    soilTemp: '72°F – 80°F at 2" Depth',
    protocol: 'Bench cut elevation to 0.450" for solar shade on root crowns. Smart ET-driven cycle-and-soak cycle at 04:30 AM via subterranean TDR probes.',
    biologicalInput: 'Yucca Root Wetting Agent + Potassium Silicate (Cell Wall Toughener)'
  },
  {
    season: 'Early Autumn',
    timing: 'September – Early October',
    target: 'Core Renovation & Laser Overseeding',
    soilTemp: '65°F – 58°F at 2" Depth',
    protocol: 'Shatter-tine fracture aeration. Slit-seeding of elite 007 Creeping Bentgrass & Slender Fine Fescues. Topdressing with 80/20 washed sand/compost blend.',
    biologicalInput: 'High-Fungal Vermicompost Extract + Humic Acid Granules'
  },
  {
    season: 'Late Autumn',
    timing: 'November – Dormancy',
    target: 'Root Carbohydrate Storage & Snow Mold Antagonism',
    soilTemp: '42°F – 36°F at 2" Depth',
    protocol: 'Final dormant reel cut at 0.300" to prevent winter blade matting. High-potassium liquid foliar spray to fortify cell sap against freezing.',
    biologicalInput: 'Beneficial Bacillus subtilis microbial shield + Micronized Iron'
  }
];

export default function App() {
  // Workbench state
  const [acres, setAcres] = useState<number>(1.5);
  const [soilTextureKey, setSoilTextureKey] = useState<string>('sandy_loam');
  const [currentPh, setCurrentPh] = useState<number>(5.6);
  const [organicMatter, setOrganicMatter] = useState<number>(2.4);
  const [compactionPsi, setCompactionPsi] = useState<number>(240);

  // Mower inspection state
  const [mowerMode, setMowerMode] = useState<'reel' | 'rotary'>('reel');

  // Intake Form state
  const [estateName, setEstateName] = useState('');
  const [estateLocation, setEstateLocation] = useState('');
  const [estateAcreageInput, setEstateAcreageInput] = useState('1.5 - 3.0 Acres');
  const [primaryGoal, setPrimaryGoal] = useState('organic-conversion');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Accessible IDs
  const acresId = useId();
  const phId = useId();
  const omId = useId();
  const psiId = useId();

  // Agronomic Calculations
  const sqFootage = acres * 43560;
  const currentTexture = SOIL_TEXTURES[soilTextureKey];

  // Lime calculation: Target is pH 6.5
  // Raising 1.0 pH unit in sandy loam requires ~50 lbs/1,000 sq ft of pure calcitic limestone
  // Silt loam requires ~80 lbs/1,000 sq ft; clay requires ~100 lbs/1,000 sq ft.
  const phDelta = Math.max(0, 6.5 - currentPh);
  const textureMultiplier = soilTextureKey === 'engineered_sand' ? 35 : soilTextureKey === 'sandy_loam' ? 50 : soilTextureKey === 'fine_loam' ? 80 : 105;
  const limePoundsTotal = Math.round((phDelta * textureMultiplier * sqFootage) / 1000);
  const limeTonsTotal = (limePoundsTotal / 2000).toFixed(2);

  // Sulfur calculation if alkaline (pH > 6.8)
  const sulfurDelta = Math.max(0, currentPh - 6.8);
  const sulfurPoundsTotal = Math.round((sulfurDelta * 20 * sqFootage) / 1000);

  // Organic matter deficit calculation (Target 5.0% OM in top 4" root zone)
  const omDeficit = Math.max(0, 5.0 - organicMatter);
  // 1% OM increase across 1 acre of 4" depth requires ~40 cubic yards of finished compost
  const compostYardsNeeded = Math.round(acres * omDeficit * 38);

  // Weekly water evapotranspiration (ET): 1.0 inch of water across 1 acre = 27,154 gallons
  const weeklyWaterGal = Math.round(acres * 27154 * (compactionPsi > 280 ? 0.75 : 1.1));

  // Compaction diagnosis
  const isSeverelyCompacted = compactionPsi >= 300;
  const aerationType = isSeverelyCompacted 
    ? 'Deep Shatter-Tine Aeration (10" Depth) + Sub-Surface Sand Injection'
    : compactionPsi >= 200 
    ? 'Hollow-Tine Coring (0.75" Tines at 2x2" Pattern)' 
    : 'Solid-Tine Rotary Vane Spiking (Minimal Surface Interruption)';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="turf-app-wrapper">
      {/* TOP STATUS BAR */}
      <aside className="turf-status-bar" aria-label="Agronomic Field Readout">
        <div className="turf-status-container">
          <div className="turf-status-item">
            <span className="live-pulse" aria-hidden="true"></span>
            <span className="mono-sub">FIELD CADENCE:</span>
            <span className="mono-bold">SPRING BIOLOGICAL RESTORATION ACTIVE</span>
          </div>
          <div className="turf-status-item hide-mobile">
            <span className="mono-sub">SOIL LAB CALIBRATION:</span>
            <span>UMASS &amp; CORNELL AG-EXTENSION STANDARDS</span>
          </div>
          <div className="turf-status-item hide-mobile">
            <span className="mono-sub">ACCREDITATION:</span>
            <span>GCSAA #41890 · OMRI LISTED PROGRAM</span>
          </div>
          <div className="turf-status-item">
            <span className="mono-sub">TERRITORY:</span>
            <span className="coords-badge">NEW ENGLAND COAST &amp; BERKSHIRE ESTATES</span>
          </div>
        </div>
      </aside>

      {/* MASTER ESTATE HEADER */}
      <header className="turf-master-header">
        <div className="turf-header-inner">
          <a href="#hero" className="turf-brand-lockup">
            <span className="turf-brand-name">NORDIC TURF &amp; AGRONOMY</span>
            <span className="turf-brand-sub">ESTATE LAWN BIOLOGY · ARCHITECTURAL SOIL SCIENCE</span>
          </a>

          <nav className="turf-header-nav" aria-label="Main Navigation">
            <a href="#workbench">01. SOIL AMENDMENT LAB</a>
            <a href="#shear-comparator">02. REEL VS ROTARY</a>
            <a href="#machinery">03. PRECISION TOOLING</a>
            <a href="#cadence">04. 12-MONTH CADENCE</a>
            <a href="#commission">05. INTAKE</a>
          </nav>

          <a href="#commission" className="turf-btn-primary">
            REQUEST FIELD SOIL CORE
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="turf-hero-section">
        <div className="turf-hero-grid">
          <div className="turf-hero-content">
            <div className="pill-tag">
              <Sprout size={13} aria-hidden="true" />
              <span>ESTATE AGRONOMY // LIVING RHIZOSPHERE</span>
            </div>
            
            <h1 className="turf-hero-h1">
              LIVING SOIL BIOLOGY
              <span className="turf-hero-accent">CULTURED FOR PRIVATE ESTATES.</span>
            </h1>

            <p className="turf-hero-summary">
              We replace brute chemical force-feeding with microbiological soil regeneration. 
              Precision 11-blade reel mowers cut with surgical scissor shear at 0.300-inch bench heights, 
              while sub-surface shatter-tine aeration creates deep root channels that permanently eliminate compaction.
            </p>

            <div className="turf-hero-actions">
              <a href="#workbench" className="turf-btn-primary-lg">
                <Sliders size={16} aria-hidden="true" />
                OPEN SOIL AMENDMENT LAB
              </a>
              <a href="#shear-comparator" className="turf-btn-secondary-lg">
                INSPECT REEL CUT QUALITY
              </a>
            </div>

            <div className="turf-trust-row" aria-label="Core Metrics">
              <div className="trust-cell">
                <span className="trust-number">6.5 pH</span>
                <span className="trust-label">TARGET RHIZOSPHERE</span>
              </div>
              <div className="trust-divider" aria-hidden="true"></div>
              <div className="trust-cell">
                <span className="trust-number">0.300"</span>
                <span className="trust-label">11-BLADE BENCH CUT</span>
              </div>
              <div className="trust-divider" aria-hidden="true"></div>
              <div className="trust-cell">
                <span className="trust-number">100%</span>
                <span className="trust-label">ORGANIC RESIDUALS</span>
              </div>
              <div className="trust-divider" aria-hidden="true"></div>
              <div className="trust-cell">
                <span className="trust-number">ZERO</span>
                <span className="trust-label">CHEMICAL LEACHING</span>
              </div>
            </div>
          </div>

          <div className="turf-hero-visual">
            <div className="image-frame">
              <img 
                src="/turf-hero.jpg" 
                alt="Estate lawn with laser-graded creeping bentgrass and dense living root structure" 
                className="turf-feature-img"
              />
              <div className="image-caption-overlay">
                <div className="caption-pill">FIELD SPECIMEN // WATCH HILL ESTATE</div>
                <div className="caption-details">
                  <span>9.2% Mycorrhizal colonization</span> · <span>0.275" scissor cut</span> · <span>8.5" root penetration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 01: INTERACTIVE LIVING SOIL AMENDMENT LAB */}
      <section id="workbench" className="turf-section bg-sand">
        <div className="turf-section-inner">
          <div className="section-head">
            <div className="pill-tag">
              <Gauge size={13} aria-hidden="true" />
              <span>INTERACTIVE WORKBENCH // FIELD CALCULATOR</span>
            </div>
            <h2 className="section-title">LIVING SOIL AMENDMENT &amp; CATION-EXCHANGE LAB</h2>
            <p className="section-lead">
              Enter your estate acreage, soil test lab results, and penetrometer compaction readings to calculate exact biological amendments, lime tonnages, and aeration depths.
            </p>
          </div>

          <div className="workbench-card-grid">
            {/* Input Controls */}
            <div className="workbench-inputs-card">
              <div className="card-header-bar">
                <span className="card-kicker">01 // ESTATE PARAMETERS</span>
                <span className="card-status-dot">ACTIVE ENGINE</span>
              </div>

              {/* Acreage Slider */}
              <div className="input-group">
                <div className="input-label-row">
                  <label htmlFor={acresId} className="input-label">ESTATE TURF AREA</label>
                  <span className="input-val-badge">{acres.toFixed(2)} ACRES ({sqFootage.toLocaleString()} SQ. FT.)</span>
                </div>
                <input 
                  id={acresId}
                  type="range" 
                  min="0.25" 
                  max="12.0" 
                  step="0.25" 
                  value={acres} 
                  onChange={(e) => setAcres(parseFloat(e.target.value))}
                  className="turf-slider"
                />
                <div className="slider-limits">
                  <span>0.25 Acre (Suburban)</span>
                  <span>6.0 Acres</span>
                  <span>12.0 Acres (Great Meadow)</span>
                </div>
              </div>

              {/* Soil Texture Select */}
              <div className="input-group">
                <label className="input-label">SOIL PROFILE TEXTURE</label>
                <div className="texture-grid" role="radiogroup" aria-label="Soil Texture Profiles">
                  {Object.entries(SOIL_TEXTURES).map(([key, spec]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={soilTextureKey === key}
                      onClick={() => setSoilTextureKey(key)}
                      className={`texture-option-btn ${soilTextureKey === key ? 'active' : ''}`}
                    >
                      <span className="texture-name">{spec.name}</span>
                      <span className="texture-meta">CEC ~{spec.defaultCec} · {spec.infiltrationRate}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Soil pH */}
              <div className="input-group">
                <div className="input-label-row">
                  <label htmlFor={phId} className="input-label">LAB SOIL TEST pH</label>
                  <span className={`input-val-badge ${currentPh < 6.0 ? 'badge-alert' : 'badge-good'}`}>
                    {currentPh.toFixed(1)} pH ({currentPh < 6.0 ? 'Acidic - High Aluminum Toxicity Risk' : currentPh <= 7.0 ? 'Optimal Rhizosphere' : 'Alkaline'})
                  </span>
                </div>
                <input 
                  id={phId}
                  type="range" 
                  min="4.8" 
                  max="8.0" 
                  step="0.1" 
                  value={currentPh} 
                  onChange={(e) => setCurrentPh(parseFloat(e.target.value))}
                  className="turf-slider"
                />
                <div className="slider-limits">
                  <span>4.8 (Cape Cod Acid)</span>
                  <span>6.5 (Bentgrass Sweet Spot)</span>
                  <span>8.0 (Alkaline Limestone)</span>
                </div>
              </div>

              {/* Organic Matter % */}
              <div className="input-group">
                <div className="input-label-row">
                  <label htmlFor={omId} className="input-label">ORGANIC MATTER (OM %)</label>
                  <span className="input-val-badge">{organicMatter.toFixed(1)}% (Target: 5.0%+)</span>
                </div>
                <input 
                  id={omId}
                  type="range" 
                  min="1.0" 
                  max="7.0" 
                  step="0.1" 
                  value={organicMatter} 
                  onChange={(e) => setOrganicMatter(parseFloat(e.target.value))}
                  className="turf-slider"
                />
                <div className="slider-limits">
                  <span>1.0% (Depleted Sand)</span>
                  <span>3.5% (Average)</span>
                  <span>7.0% (Rich Biological Loam)</span>
                </div>
              </div>

              {/* Compaction Penetrometer Reading */}
              <div className="input-group">
                <div className="input-label-row">
                  <label htmlFor={psiId} className="input-label">PENETROMETER RESISTANCE</label>
                  <span className={`input-val-badge ${compactionPsi > 280 ? 'badge-alert' : 'badge-good'}`}>
                    {compactionPsi} PSI ({compactionPsi > 280 ? 'Severe Root Stunting' : 'Open Pore Space'})
                  </span>
                </div>
                <input 
                  id={psiId}
                  type="range" 
                  min="120" 
                  max="400" 
                  step="10" 
                  value={compactionPsi} 
                  onChange={(e) => setCompactionPsi(parseInt(e.target.value, 10))}
                  className="turf-slider"
                />
                <div className="slider-limits">
                  <span>120 PSI (Fluffy Loam)</span>
                  <span>250 PSI (Traffic Zone)</span>
                  <span>400 PSI (Compacted Hardpan)</span>
                </div>
              </div>
            </div>

            {/* Calculated Prescription Readout */}
            <div className="workbench-results-card">
              <div className="card-header-bar">
                <span className="card-kicker">02 // FIELD PRESCRIPTION</span>
                <span className="card-sub-kicker">CALCULATED BIOLOGICAL TARGETS</span>
              </div>

              <div className="results-hero-stat">
                <span className="stat-eyebrow">PRIMARY AMENDMENT NEED</span>
                {phDelta > 0 ? (
                  <div className="stat-big-lockup">
                    <span className="stat-big-val">{limeTonsTotal}</span>
                    <span className="stat-big-unit">TONS OF HIGH-CALCITIC LIME</span>
                  </div>
                ) : sulfurDelta > 0 ? (
                  <div className="stat-big-lockup">
                    <span className="stat-big-val">{(sulfurPoundsTotal / 2000).toFixed(2)}</span>
                    <span className="stat-big-unit">TONS OF MICRONIZED SULFUR</span>
                  </div>
                ) : (
                  <div className="stat-big-lockup">
                    <span className="stat-big-val text-green">BALANCED</span>
                    <span className="stat-big-unit">SOIL pH IS AT GOLD-STANDARD 6.5</span>
                  </div>
                )}
                <p className="stat-narrative">
                  {phDelta > 0 
                    ? `To raise ${acres} acres from pH ${currentPh.toFixed(1)} to 6.5 without shocking microbial colonies, apply ${limePoundsTotal.toLocaleString()} lbs in split spring/autumn topdressings.` 
                    : sulfurDelta > 0
                    ? `To reduce alkalinity across ${acres} acres down to 6.5, apply ${sulfurPoundsTotal.toLocaleString()} lbs of organic elemental sulfur.`
                    : `Rhizosphere pH is optimal for nutrient uptake. Zero chemical buffer needed.`}
                </p>
              </div>

              <div className="prescription-matrix">
                <div className="matrix-row">
                  <div className="matrix-cell">
                    <span className="cell-label">MATURE COMPOST VOLUME</span>
                    <span className="cell-value">{compostYardsNeeded} CUBIC YARDS</span>
                    <span className="cell-note">Increases OM to 5.0% across 4" root zone</span>
                  </div>
                  <div className="matrix-cell">
                    <span className="cell-label">ESTIMATED WEEKLY ET DEMAND</span>
                    <span className="cell-value">{weeklyWaterGal.toLocaleString()} GAL / WEEK</span>
                    <span className="cell-note">Cycle &amp; soak based on 1.0" ET crop coefficient</span>
                  </div>
                </div>

                <div className="matrix-row">
                  <div className="matrix-cell">
                    <span className="cell-label">AERATION PROTOCOL</span>
                    <span className="cell-value cell-text-sm">{aerationType}</span>
                    <span className="cell-note">Based on {compactionPsi} PSI penetrometer resistance</span>
                  </div>
                  <div className="matrix-cell">
                    <span className="cell-label">BIOLOGICAL INOCULATION</span>
                    <span className="cell-value cell-text-sm">{(acres * 3.5).toFixed(1)} Lbs Glomus intraradices Mycorrhizae</span>
                    <span className="cell-note">Expands effective root surface area by 400%</span>
                  </div>
                </div>
              </div>

              <div className="workbench-cta-box">
                <div className="cta-icon-box">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div className="cta-text-box">
                  <span className="cta-title">Need Exact Lab Core Sampling?</span>
                  <span className="cta-sub">Our field agronomist visits your property with a pneumatic soil probe for 24-point laboratory nutrient testing.</span>
                </div>
                <a href="#commission" className="turf-btn-secondary">
                  BOOK TEST
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: REEL VS ROTARY CUT QUALITY COMPARATOR */}
      <section id="shear-comparator" className="turf-section bg-white">
        <div className="turf-section-inner">
          <div className="section-head">
            <div className="pill-tag">
              <Layers size={13} aria-hidden="true" />
              <span>CUT QUALITY // CELL INTEGRITY</span>
            </div>
            <h2 className="section-title">THE 11-BLADE REEL VS. HIGH-RPM ROTARY CUT</h2>
            <p className="section-lead">
              Why your lawn turns brown 24 hours after traditional mowing: standard rotary lawnmowers bash grass blades with blunt force at 3,000 RPM. We use calibrated reel mowers that cleanly scissor individual stems.
            </p>
          </div>

          <div className="comparator-container">
            <div className="comparator-toggle-bar">
              <button 
                type="button" 
                onClick={() => setMowerMode('reel')}
                className={`comparator-btn ${mowerMode === 'reel' ? 'active-reel' : ''}`}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                NORDIC 11-BLADE CYLINDER REEL CUT (OUR STANDARD)
              </button>
              <button 
                type="button" 
                onClick={() => setMowerMode('rotary')}
                className={`comparator-btn ${mowerMode === 'rotary' ? 'active-rotary' : ''}`}
              >
                TYPICAL COMMERCIAL ROTARY MOWER (BLUNT BASH)
              </button>
            </div>

            <div className="comparator-display-card">
              {mowerMode === 'reel' ? (
                <div className="comparator-grid reel-active">
                  <div className="display-visual-box">
                    <div className="blade-graphic-reel">
                      <div className="reel-blade-stem">
                        <div className="cut-line-clean">
                          <span className="cut-indicator">CLEAN SCISSOR SHEAR</span>
                        </div>
                      </div>
                      <span className="magnify-badge">400x MICROSCOPIC VIEW // REEL</span>
                    </div>
                  </div>
                  <div className="display-intel-box">
                    <span className="intel-kicker text-green">ZERO TISSUE NECROSIS</span>
                    <h3 className="intel-title">True Scissor Shear at 0.250" – 0.375"</h3>
                    <ul className="intel-list">
                      <li>
                        <strong>Surgical horizontal cell wall severance:</strong> The spinning 11-blade cylinder meets a fixed bedknife with zero clearance, cutting like tailor shears.
                      </li>
                      <li>
                        <strong>Rapid wound closure in under 2 hours:</strong> Leaf cuticle retains internal moisture and natural defenses against environmental stress.
                      </li>
                      <li>
                        <strong>92% lower leaf spot &amp; dollar spot susceptibility:</strong> Without torn open cell walls, fungal spores cannot penetrate the vascular bundle.
                      </li>
                      <li>
                        <strong>Uniform deep emerald carpet:</strong> Eliminates the pale "brown tip haze" that plagues typical mowed turf after hot sunny afternoons.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="comparator-grid rotary-active">
                  <div className="display-visual-box">
                    <div className="blade-graphic-rotary">
                      <div className="rotary-blade-stem">
                        <div className="cut-line-torn">
                          <span className="cut-indicator-alert">SHREDDED VASCULAR DAMAGE</span>
                        </div>
                      </div>
                      <span className="magnify-badge">400x MICROSCOPIC VIEW // ROTARY</span>
                    </div>
                  </div>
                  <div className="display-intel-box">
                    <span className="intel-kicker text-red">HIGH VASCULAR SHREDDING</span>
                    <h3 className="intel-title">Blunt Impact at 180 MPH Tip Speed</h3>
                    <ul className="intel-list">
                      <li>
                        <strong>Ripped &amp; fractured vascular bundles:</strong> Even freshly sharpened rotary blades rely on high-velocity blunt impact that splits grass fiber downward.
                      </li>
                      <li>
                        <strong>Brown tip dieback within 24 hours:</strong> The top 1/8" of shredded leaf tissue dies and bleaches white, giving the lawn a dull straw-like cast.
                      </li>
                      <li>
                        <strong>Massive transpiration water loss:</strong> Ripped cell walls act like open pores, increasing irrigation requirements by up to 35%.
                      </li>
                      <li>
                        <strong>Fungal highway for disease:</strong> Brown patch, Pythium blight, and leaf spot mycelium easily colonize open torn wounds.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: FLEET & MECHANIZED TOOLING */}
      <section id="machinery" className="turf-section bg-sand">
        <div className="turf-section-inner">
          <div className="section-head">
            <div className="pill-tag">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>SHOP FLEET // HARDWARE SPECIFICATION</span>
            </div>
            <h2 className="section-title">COMMERCIAL ESTATE MACHINERY &amp; TOOLING</h2>
            <p className="section-lead">
              Our fleet is purpose-built for sensitive estate grounds. We use zero-leak all-electric cylinder mowers and sub-surface fracture aerators that never damage fine irrigation heads.
            </p>
          </div>

          <div className="tool-grid">
            <div className="tool-card">
              <span className="tool-category">ALL-ELECTRIC CYLINDER CUTTING</span>
              <h3 className="tool-name">Toro Greensmaster eTriFlex 3370</h3>
              <p className="tool-desc">
                100% lithium-ion electric drive. Zero hydraulic oil lines crossing the lawn, completely eliminating catastrophic high-pressure oil leak burns on manicured turf. Whisper-quiet operation below 68 dBA.
              </p>
              <div className="tool-specs">
                <div className="spec-item">
                  <span className="spec-k">BENCH CUT RANGE:</span>
                  <span className="spec-v">0.125" – 0.500"</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">CUTTING HEADS:</span>
                  <span className="spec-v">11-Blade DPA Dual Precision</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">NOISE PROFILE:</span>
                  <span className="spec-v">&lt; 68 dBA (Whisper Quiet)</span>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <span className="tool-category">SUB-SURFACE FRACTURE</span>
              <h3 className="tool-name">AerWay Shatter-Tine Ground Reliever</h3>
              <p className="tool-desc">
                Twisted offset alloy tines penetrate down to 10" below the surface, creating lateral fractal fissures that shatter hardpan compaction without bringing unsightly mud cores to the lawn surface.
              </p>
              <div className="tool-specs">
                <div className="spec-item">
                  <span className="spec-k">PENETRATION DEPTH:</span>
                  <span className="spec-v">Up to 10.0" (Sub-Hardpan)</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">FRACTURE ACTION:</span>
                  <span className="spec-v">Lateral Shatter (Zero Mud Plugs)</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">ROOT EFFECT:</span>
                  <span className="spec-v">+250% Pore Space Infiltration</span>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <span className="tool-category">TELEMETRY &amp; SMART IRRIGATION</span>
              <h3 className="tool-name">Davis Instruments TDR Soil Network</h3>
              <p className="tool-desc">
                Subterranean stainless steel sensor probes installed at 3" and 7" depths continuously report volumetric water content, soil temperature, and electrical conductivity to prevent both drought stress and fungal over-watering.
              </p>
              <div className="tool-specs">
                <div className="spec-item">
                  <span className="spec-k">SENSOR PROTOCOL:</span>
                  <span className="spec-v">Time-Domain Reflectometry (TDR)</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">READ CADENCE:</span>
                  <span className="spec-v">Real-Time Cellular Telemetry</span>
                </div>
                <div className="spec-item">
                  <span className="spec-k">INTEGRATION:</span>
                  <span className="spec-v">Hunter ACC2 &amp; Rain Bird 2-Wire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: 12-MONTH ESTATE CADENCE */}
      <section id="cadence" className="turf-section bg-white">
        <div className="turf-section-inner">
          <div className="section-head">
            <div className="pill-tag">
              <Calendar size={13} aria-hidden="true" />
              <span>ANNUAL PROTOCOL // LIVING BIOLOGY</span>
            </div>
            <h2 className="section-title">12-MONTH ESTATE FIELD PRESCRIPTION</h2>
            <p className="section-lead">
              True organic agronomy is synchronized with soil temperature rather than arbitrary calendar dates. Here is our annual field cadence for private New England grounds.
            </p>
          </div>

          <div className="cadence-table-wrap">
            <table className="cadence-table">
              <thead>
                <tr>
                  <th>PHASE &amp; TIMING</th>
                  <th>SOIL TEMP TARGET</th>
                  <th>AGRONOMIC PROTOCOL</th>
                  <th>ORGANIC BIOLOGICAL INPUT</th>
                </tr>
              </thead>
              <tbody>
                {ANNUAL_CADENCE.map((phase, idx) => (
                  <tr key={idx}>
                    <td className="cadence-phase-cell">
                      <span className="phase-season">{phase.season}</span>
                      <span className="phase-timing">{phase.timing}</span>
                    </td>
                    <td className="cadence-temp-cell">
                      <span className="temp-badge">{phase.soilTemp}</span>
                    </td>
                    <td className="cadence-protocol-cell">
                      <strong className="protocol-target">{phase.target}</strong>
                      <p className="protocol-body">{phase.protocol}</p>
                    </td>
                    <td className="cadence-input-cell">
                      <span className="input-pill">{phase.biologicalInput}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 05: ESTATE INTAKE & COMMISSION */}
      <section id="commission" className="turf-section bg-sand">
        <div className="turf-section-inner max-w-narrow">
          <div className="section-head text-center">
            <div className="pill-tag mx-auto">
              <PhoneCall size={13} aria-hidden="true" />
              <span>ESTATE INTAKE // FIELD EVALUATION</span>
            </div>
            <h2 className="section-title">COMMISSION AN ESTATE SOIL AUDIT</h2>
            <p className="section-lead">
              We work directly with estate owners, landscape architects, and property managers. All inquiries receive an on-site field evaluation and pneumatic soil core sample by our licensed agronomist.
            </p>
          </div>

          {formSubmitted ? (
            <div className="submission-success-box">
              <div className="success-icon-wrap">
                <CheckCircle2 size={36} aria-hidden="true" />
              </div>
              <h3 className="success-title">ESTATE SOIL AUDIT LOGGED</h3>
              <p className="success-desc">
                Thank you, <strong>{estateName || 'Estate Manager'}</strong>. Your evaluation request for <strong>{estateLocation || 'your property'}</strong> has been assigned to our field agronomy team. We will contact you within 24 hours to schedule the pneumatic core extraction.
              </p>
              <div className="success-details-list">
                <span>ESTATE SCOPE: {estateAcreageInput}</span>
                <span>·</span>
                <span>PRIMARY FOCUS: {primaryGoal.toUpperCase().replace('-', ' ')}</span>
                <span>·</span>
                <span>REGION: GREATER NEW ENGLAND</span>
              </div>
              <button 
                type="button" 
                onClick={() => setFormSubmitted(false)}
                className="turf-btn-secondary"
                style={{ marginTop: '1.5rem' }}
              >
                SUBMIT ANOTHER PROPERTY
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="estate-intake-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="estate-name-input">Estate Name or Owner</label>
                  <input 
                    id="estate-name-input"
                    type="text" 
                    required 
                    value={estateName}
                    onChange={(e) => setEstateName(e.target.value)}
                    placeholder="e.g. Highfield Estate / Sarah Jenkins"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="estate-loc-input">Property Town &amp; State</label>
                  <input 
                    id="estate-loc-input"
                    type="text" 
                    required 
                    value={estateLocation}
                    onChange={(e) => setEstateLocation(e.target.value)}
                    placeholder="e.g. Newport, RI or Greenwich, CT"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="estate-acre-select">Turf Footprint</label>
                  <select 
                    id="estate-acre-select"
                    value={estateAcreageInput}
                    onChange={(e) => setEstateAcreageInput(e.target.value)}
                  >
                    <option value="0.5 - 1.5 Acres">0.5 – 1.5 Acres (Formal Lawn)</option>
                    <option value="1.5 - 3.0 Acres">1.5 – 3.0 Acres (Main Estate Grounds)</option>
                    <option value="3.0 - 8.0 Acres">3.0 – 8.0 Acres (Great Lawn &amp; Meadow)</option>
                    <option value="8.0+ Acres">8.0+ Acres (Full Estate Park &amp; Equestrian)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="primary-goal-select">Primary Objective</label>
                  <select 
                    id="primary-goal-select"
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                  >
                    <option value="organic-conversion">Transition from Chemical to 100% Organic</option>
                    <option value="reel-mow-install">Upgrade to Precision 11-Blade Reel Cutting</option>
                    <option value="compaction-drainage">Alleviate Severe Hardpan &amp; Poor Drainage</option>
                    <option value="bentgrass-renovation">Creeping Bentgrass / Fine Fescue Renovation</option>
                    <option value="architect-coordination">New Estate Construction Takeoff</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="estate-notes-input">Current Turf Conditions &amp; Specific Challenges</label>
                <textarea 
                  id="estate-notes-input"
                  rows={3}
                  placeholder="Describe your current lawn issues (e.g. summer browning, moss encroachment, heavy shade, dog traffic, desire for micro-clover meadow)..."
                ></textarea>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="turf-btn-primary-lg">
                  SUBMIT FOR ON-SITE SOIL AUDIT
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
                <span className="submit-subtext">
                  Direct inquiry to certified agronomy directors. No sales representatives.
                </span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* MASTER ESTATE FOOTER */}
      <footer className="turf-master-footer">
        <div className="turf-footer-inner">
          <div className="footer-col-brand">
            <span className="footer-brand-title">NORDIC TURF &amp; AGRONOMY</span>
            <p className="footer-brand-desc">
              Private estate lawn biology, precision cylinder reel mowing, and organic living soil restoration. Engineered for coastal estates, historic grounds, and championship turf across New England.
            </p>
            <div className="footer-badges">
              <span>GCSAA CERTIFIED</span>
              <span>·</span>
              <span>OMRI ORGANIC LISTED</span>
              <span>·</span>
              <span>MASS. PESTICIDE LIC. #29481</span>
              <span>·</span>
              <span>RI COMMERCIAL APPLICATOR #4812</span>
            </div>
          </div>

          <div className="footer-col-links">
            <span className="footer-heading">COASTAL FIELD SHOP</span>
            <p>
              14 Ocean Avenue, Suite 2B<br />
              Newport, RI 02840<br />
              Field Line: +1 (401) 847-TURF
            </p>
          </div>

          <div className="footer-col-links">
            <span className="footer-heading">BERKSHIRE &amp; METRO FIELD SHOP</span>
            <p>
              480 Stockbridge Road<br />
              Great Barrington, MA 01230<br />
              Field Line: +1 (413) 528-SOIL
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} NORDIC TURF &amp; AGRONOMY LLC. ALL RIGHTS RESERVED.</span>
          <span>ESTATE LAWN BIOLOGY &amp; ARCHITECTURAL AGRONOMY</span>
        </div>
      </footer>
    </div>
  );
}
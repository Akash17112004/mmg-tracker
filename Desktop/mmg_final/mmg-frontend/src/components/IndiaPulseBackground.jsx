// Natural Earth low-resolution country outline, embedded so the background works offline.
const INDIA_OUTLINE = `
  M 397.1 139.4 L 398.0 145.2 L 393.6 148.1 L 394.6 157.5 L 385.7 154.8 L 369.5 165.4 L 369.9 174.2 
   L 362.9 187.1 L 362.3 194.6 L 356.7 207.3 L 346.9 203.8 L 346.5 219.8 L 343.6 225.0 L 344.9 231.5 
   L 338.8 235.2 L 332.2 210.8 L 328.7 210.8 L 326.7 220.7 L 319.8 212.7 L 323.7 203.9 L 329.3 203.0 
   L 335.1 190.0 L 327.8 187.4 L 316.2 187.6 L 304.3 185.5 L 303.2 174.8 L 297.2 174.0 L 287.3 167.4 
   L 282.9 177.8 L 291.9 186.0 L 284.1 191.7 L 281.3 197.3 L 289.0 201.4 L 286.9 210.7 L 291.2 222.3 
   L 293.2 235.0 L 291.4 240.6 L 282.9 240.4 L 267.4 243.6 L 268.1 255.2 L 261.5 264.3 L 243.4 274.7 
   L 229.4 292.8 L 220.0 302.5 L 207.5 312.6 L 207.5 319.7 L 201.3 323.5 L 190.0 329.0 L 184.1 329.8 
   L 180.4 341.6 L 183.0 361.6 L 183.7 374.4 L 178.3 389.0 L 178.3 415.2 L 171.8 415.9 L 166.1 427.7 
   L 169.9 432.7 L 158.5 437.1 L 154.3 447.6 L 149.3 452.0 L 137.4 437.6 L 131.6 416.0 L 126.8 400.5 
   L 122.4 393.2 L 115.8 378.4 L 112.6 359.2 L 110.5 349.5 L 99.1 328.4 L 93.9 298.5 L 90.2 278.8 
   L 90.2 260.2 L 87.8 245.8 L 69.6 255.0 L 60.7 253.1 L 44.4 234.5 L 50.4 228.9 L 46.7 222.9 
   L 32.0 209.8 L 40.3 199.5 L 67.9 199.5 L 65.4 186.3 L 58.4 178.5 L 56.9 166.7 L 48.8 159.7 
   L 62.6 143.6 L 77.1 144.8 L 90.2 128.6 L 98.0 113.0 L 110.2 97.5 L 110.0 86.5 L 120.7 77.6 
   L 110.6 70.0 L 106.2 59.6 L 101.8 46.1 L 107.9 39.5 L 126.9 43.2 L 140.9 40.9 L 153.0 28.0 
   L 166.4 46.1 L 165.2 58.6 L 170.2 66.5 L 169.7 74.4 L 160.8 72.3 L 164.3 89.3 L 176.6 99.0 
   L 194.0 109.8 L 186.0 116.8 L 181.2 131.2 L 193.3 137.0 L 205.1 144.6 L 221.4 153.2 L 238.6 155.2 
   L 245.8 163.0 L 255.5 164.5 L 270.6 168.1 L 281.0 167.8 L 282.4 161.7 L 280.8 152.0 L 281.8 145.3 
   L 289.4 142.1 L 290.4 154.2 L 290.7 157.3 L 302.1 163.1 L 310.0 160.7 L 320.5 161.8 L 330.8 161.3 
   L 331.6 151.9 L 326.5 146.9 L 336.6 145.0 L 348.0 133.6 L 362.5 123.7 L 373.0 127.5 L 381.9 121.0 
   L 387.8 130.6 L 383.6 137.1 L 397.1 139.4 Z
`;

const NETWORK_LINES = [
  [145, 134, 127, 160],  // Delhi to Jaipur
  [145, 134, 148, 216],  // Delhi to central India
  [148, 216, 91, 281],   // Central India to Mumbai
  [148, 216, 161, 307],  // Central India to Hyderabad
  [161, 307, 150, 375],  // Hyderabad to Bengaluru
  [161, 307, 183, 373],  // Hyderabad to Chennai
  [145, 134, 285, 227],  // Delhi to Kolkata
  [285, 227, 327, 172],  // Kolkata to Guwahati
];

const NODES = [
  { x: 145, y: 134, delay: '0s', name: 'NEW DELHI' },
  { x: 127, y: 160, delay: '.8s', name: 'JAIPUR' },
  { x: 91, y: 281, delay: '1.6s', name: 'MUMBAI' },
  { x: 148, y: 216, delay: '2.2s', name: 'BHOPAL' },
  { x: 161, y: 307, delay: '1.1s', name: 'HYDERABAD' },
  { x: 150, y: 375, delay: '2.8s', name: 'BENGALURU' },
  { x: 183, y: 373, delay: '1.9s', name: 'CHENNAI' },
  { x: 285, y: 227, delay: '.5s', name: 'KOLKATA' },
  { x: 327, y: 172, delay: '2.4s', name: 'GUWAHATI' },
];

export default function IndiaPulseBackground({ variant = 'workspace' }) {
  return (
    <div className={`india-pulse-bg india-pulse-bg--${variant}`} aria-hidden="true">
      <div className="india-pulse-halo india-pulse-halo--one" />
      <div className="india-pulse-halo india-pulse-halo--two" />
      <svg className="india-pulse-map" viewBox="0 0 430 490" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="indiaPulseFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ce7d5" stopOpacity=".17" />
            <stop offset="52%" stopColor="#6c7cff" stopOpacity=".08" />
            <stop offset="100%" stopColor="#c7b47a" stopOpacity=".06" />
          </linearGradient>
          <linearGradient id="indiaPulseStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c7b47a" />
            <stop offset="40%" stopColor="#5ce7d5" />
            <stop offset="100%" stopColor="#7888ff" />
          </linearGradient>
          <radialGradient id="indiaPulseRadar">
            <stop offset="0%" stopColor="#5ce7d5" stopOpacity=".22" />
            <stop offset="100%" stopColor="#5ce7d5" stopOpacity="0" />
          </radialGradient>
          <clipPath id="indiaPulseClip"><path d={INDIA_OUTLINE} /></clipPath>
          <filter id="indiaPulseGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle className="india-pulse-orbit" cx="224" cy="236" r="196" />
        <circle className="india-pulse-orbit india-pulse-orbit--small" cx="224" cy="236" r="164" />
        <path className="india-map-fill" d={INDIA_OUTLINE} fill="url(#indiaPulseFill)" />
        <path className="india-map-outline india-map-outline--glow" d={INDIA_OUTLINE} />
        <path className="india-map-outline" d={INDIA_OUTLINE} />

        <g clipPath="url(#indiaPulseClip)">
          <path className="india-map-grid-lines" d="M36 120 L397 120 M36 180 L397 180 M36 240 L397 240 M36 300 L397 300 M36 360 L397 360 M100 0 L100 480 M160 0 L160 480 M220 0 L220 480 M280 0 L280 480 M340 0 L340 480" />
          <path className="india-map-scan" d="M30 212 L405 212" />
        </g>

        <g className="india-network-lines" clipPath="url(#indiaPulseClip)">
          {NETWORK_LINES.map(([x1, y1, x2, y2], index) => (
            <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        <g className="india-map-islands" aria-hidden="true">
          <ellipse cx="85" cy="400" rx="2.1" ry="4.7" />
          <ellipse cx="345" cy="371" rx="2.0" ry="5.2" />
          <ellipse cx="347" cy="386" rx="1.8" ry="4.0" />
          <ellipse cx="348" cy="401" rx="1.5" ry="3.2" />
          <ellipse cx="349" cy="414" rx="1.2" ry="2.8" />
        </g>

        <g className="india-network-nodes">
          {NODES.map((node) => (
            <g key={node.name} className="india-network-node">
              <circle className="india-node-pulse" cx={node.x} cy={node.y} r="5" style={{ animationDelay: node.delay }} />
              <circle className="india-node-core" cx={node.x} cy={node.y} r="3.4" />
              <circle className="india-node-center" cx={node.x} cy={node.y} r="1.2" />
            </g>
          ))}
        </g>

        <g className="india-map-caption">
          <path d="M214 99 L231 85 L267 85" />
          <circle cx="214" cy="99" r="2" />
          <text x="271" y="88">NATIONAL GRID</text>
          <path d="M244 350 L270 365 L317 365" />
          <circle cx="244" cy="350" r="2" />
          <text x="270" y="379">LIVE NETWORK</text>
        </g>
      </svg>
      <div className="india-pulse-corner-note"><span className="india-pulse-live-dot" /> INDIA OPERATIONS GRID <span>·</span> LIVE VISUAL</div>
    </div>
  );
}

import React from 'react';

const designs = {
  1: ['sunburst', '#f4c86d', '#8b4d20', '★'],
  2: ['comet', '#9bd4ff', '#315f9c', '↗'],
  3: ['compass', '#f6d27d', '#9a681e', '✦'],
  4: ['laurel', '#8ce5e7', '#287b83', '♜'],
  5: ['crown', '#d9adff', '#7046a2', '♛'],
  6: ['phoenix', '#ffb08b', '#9a493e', '♨'],
  7: ['cosmos', '#e4a8ff', '#7544aa', '✧'],
  8: ['flame', '#ffbd6b', '#9b4e20', '♨'],
  9: ['fortress', '#9bc7ff', '#345a96', '⬟'],
  10: ['sun', '#f4d47c', '#a66a22', '☼'],
  11: ['royal', '#d7b2ff', '#69428e', '♛'],
  12: ['century', '#f2a9a0', '#873e42', '✦'],
  13: ['scroll', '#e8cb8c', '#80602c', '▤'],
  14: ['banner', '#91d5df', '#326b7b', '⚑'],
  15: ['spear', '#b6c9ff', '#455c9d', '✦'],
  16: ['trophy', '#f6cf75', '#8b5b20', '♜'],
  17: ['royal', '#d9b1ff', '#71419b', '♛'],
  18: ['laurel', '#a6e6c2', '#36775b', '✓'],
  19: ['target', '#f4c36f', '#945a21', '◎'],
  20: ['arrow', '#9ed8ff', '#315c92', '➤'],
  21: ['arcade', '#bca6ff', '#55428d', '⌘'],
  22: ['comet', '#8ddce0', '#286f77', '↗'],
  23: ['trophy', '#f4d078', '#96631d', '♜'],
  24: ['phoenix', '#ffb18a', '#984a3c', '♨'],
  25: ['cosmos', '#e4a7ff', '#70409c', '✧'],
  26: ['shield', '#d7a16e', '#78431e', 'Ⅰ'],
  27: ['shield', '#c9d9ec', '#526b8d', 'Ⅱ'],
  28: ['crown', '#f6d27a', '#98611d', 'Ⅲ'],
  29: ['crystal', '#9ce8f0', '#347e9c', '◇'],
  30: ['diamond', '#9cc7ff', '#3268a5', '◆'],
  31: ['phoenix', '#d7b0ff', '#69418f', 'Ⅵ'],
  32: ['cosmos', '#e5b5ff', '#7546a7', '∞'],
};

function Laurel({ color, flip = false }) {
  return (
    <g transform={flip ? 'translate(180 0) scale(-1 1)' : undefined} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M49 125 C20 105 20 67 42 39" />
      <path d="M37 105 Q12 101 17 83 Q35 82 37 105 M31 85 Q8 75 19 58 Q37 63 31 85 M35 66 Q23 48 39 35 Q53 48 35 66" fill={color} fillOpacity=".28"/>
    </g>
  );
}

function Ornament({ color, type }) {
  if (type === 'sunburst' || type === 'sun') {
    return <g stroke={color} strokeWidth="2" opacity=".9">{Array.from({ length: 16 }, (_, i) => <path key={i} d="M90 9 V21" transform={`rotate(${i * 22.5} 90 78)`} />)}</g>;
  }
  if (type === 'crystal' || type === 'diamond') {
    return <g fill="none" stroke={color} strokeWidth="2"><path d="M90 12 L133 57 90 144 47 57 Z"/><path d="M47 57 H133 M90 12 V144 M47 57 L90 75 133 57" opacity=".7"/></g>;
  }
  if (type === 'phoenix') {
    return <g fill={color} fillOpacity=".35" stroke={color} strokeWidth="2"><path d="M42 78 Q10 44 30 23 Q48 39 58 65 Q44 35 63 14 Q78 43 70 70 M138 78 Q170 44 150 23 Q132 39 122 65 Q136 35 117 14 Q102 43 110 70"/></g>;
  }
  return <g fill="none" stroke={color} strokeWidth="2" opacity=".85"><path d="M90 9 L98 25 116 18 113 37 132 44 119 59 133 76 114 87 119 107 99 108 90 128 81 108 61 107 66 87 47 76 61 59 48 44 67 37 64 18 82 25 Z"/></g>;
}

export default function BadgeArtwork({ badge, unlocked, progress = 0 }) {
  const [type, metal, shadow, mark] = designs[badge.id] || designs[1];
  const uid = `badge-${badge.id}`;
  const emblemPath = {
    sunburst: 'M90 29 L108 45 132 43 132 67 151 83 137 103 141 127 116 132 90 151 64 132 39 127 43 103 29 83 48 67 48 43 72 45 Z',
    comet: 'M90 25 C118 25 142 46 142 75 C142 104 119 130 90 137 C61 130 38 104 38 75 C38 46 62 25 90 25 Z',
    compass: 'M90 22 L111 51 145 58 119 86 125 121 90 107 55 121 61 86 35 58 69 51 Z',
    laurel: 'M90 25 C126 25 145 51 145 83 C145 115 122 137 90 137 C58 137 35 115 35 83 C35 51 54 25 90 25 Z',
    crown: 'M37 57 L66 76 90 36 114 76 143 57 133 119 47 119 Z',
    phoenix: 'M90 27 C105 45 127 42 145 28 C141 56 128 68 112 78 C139 82 143 109 125 130 L90 143 55 130 C37 109 41 82 68 78 C52 68 39 56 35 28 C53 42 75 45 90 27 Z',
    cosmos: 'M90 25 C126 25 145 52 145 83 C145 114 119 139 90 139 C61 139 35 114 35 83 C35 52 54 25 90 25 Z',
    flame: 'M90 22 C125 53 130 78 116 107 C107 128 73 137 57 111 C39 82 64 58 90 22 Z',
    fortress: 'M48 38 L132 38 145 58 132 121 90 145 48 121 35 58 Z',
    sun: 'M90 24 L109 43 137 39 137 67 156 84 137 103 137 131 109 127 90 146 71 127 43 131 43 103 24 84 43 67 43 39 71 43 Z',
    royal: 'M90 23 L111 46 141 43 135 74 153 91 132 109 127 139 90 129 53 139 48 109 27 91 45 74 39 43 69 46 Z',
    century: 'M90 23 C123 23 146 48 146 82 C146 116 122 141 90 141 C58 141 34 116 34 82 C34 48 57 23 90 23 Z',
    scroll: 'M48 33 Q32 33 32 50 V118 Q32 135 49 135 H131 Q148 135 148 118 V50 Q148 33 131 33 Z',
    banner: 'M43 33 H137 V105 L90 137 43 105 Z',
    spear: 'M90 19 L119 69 105 132 90 146 75 132 61 69 Z',
    trophy: 'M61 29 H119 V65 Q119 93 90 100 Q61 93 61 65 Z M61 43 H36 Q34 77 67 82 M119 43 H144 Q146 77 113 82 M90 100 V126 M68 132 H112',
    target: 'M90 23 C126 23 145 48 145 83 C145 118 126 143 90 143 C54 143 35 118 35 83 C35 48 54 23 90 23 Z',
    arrow: 'M90 22 L139 72 108 72 108 133 72 133 72 72 41 72 Z',
    arcade: 'M49 39 H131 Q144 39 144 52 V113 Q144 126 131 126 H49 Q36 126 36 113 V52 Q36 39 49 39 Z',
    crystal: 'M47 57 L69 27 H111 L133 57 90 139 Z',
    diamond: 'M90 20 L143 82 90 145 37 82 Z',
    shield: 'M90 22 L139 43 V82 Q135 120 90 145 Q45 120 41 82 V43 Z',
  }[type] || 'M90 25 L145 83 90 141 35 83 Z';

  return (
    <svg className="badgeArtwork" viewBox="0 0 180 170" role="img" aria-label={`${badge.title} collectible emblem`}>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7d7"/>
          <stop offset=".22" stopColor={metal}/>
          <stop offset=".55" stopColor={shadow}/>
          <stop offset=".78" stopColor={metal}/>
          <stop offset="1" stopColor="#fff0c2"/>
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor={metal} stopOpacity=".42"/>
          <stop offset=".5" stopColor="#111827"/>
          <stop offset="1" stopColor={shadow} stopOpacity=".7"/>
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor={metal} stopOpacity=".36"/>
          <stop offset="1" stopColor={metal} stopOpacity="0"/>
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="90" cy="82" rx="78" ry="76" fill={`url(#${uid}-glow)`}/>
      <Ornament color={metal} type={type}/>
      {(type === 'laurel' || type === 'trophy' || type === 'crown' || type === 'phoenix') && <><Laurel color={metal}/><Laurel color={metal} flip/></>}
      <path d={emblemPath} fill={`url(#${uid}-face)`} stroke={`url(#${uid}-metal)`} strokeWidth="5" filter={`url(#${uid}-shadow)`}/>
      <path d={emblemPath} transform="translate(0 0) scale(.82) translate(19 17)" fill="none" stroke="#fff5d5" strokeOpacity=".68" strokeWidth="1.8"/>
      <path d="M90 36 L126 81 90 126 54 81 Z" fill="none" stroke={metal} strokeOpacity=".48" strokeWidth="1.5"/>
      <circle cx="90" cy="82" r="28" fill="#0c1220" stroke={metal} strokeWidth="2.5"/>
      <circle cx="90" cy="82" r="22" fill="none" stroke="#fff5d5" strokeOpacity=".48" strokeWidth="1"/>
      <text x="90" y="91" textAnchor="middle" fontSize={type === 'comet' ? '35' : '31'} fontWeight="800" fill={`url(#${uid}-metal)`} stroke={shadow} strokeWidth=".6">{mark}</text>
      <path d="M60 145 H120 L111 157 H69 Z" fill={`url(#${uid}-metal)`} stroke={shadow} strokeWidth="2"/>
      <path d="M73 148 H107" stroke="#fff8dc" strokeWidth="1.5" opacity=".8"/>
      <circle cx="90" cy="151" r="4" fill="#fff4c5"/>
      {!unlocked && <path d="M0 0 H180 V170 H0 Z" fill="#080d18" fillOpacity=".2"/>}
    </svg>
  );
}

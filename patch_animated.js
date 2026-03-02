const fs = require('fs');
const path = require('path');

const stickmanPath = path.join(__dirname, 'components/Stickman.tsx');
const animatedPath = path.join(__dirname, 'components/AnimatedStickman.tsx');

const stickmanContent = fs.readFileSync(stickmanPath, 'utf8');
const animatedContent = fs.readFileSync(animatedPath, 'utf8');

function extractMethod(name) {
  const startMarker = `  const ${name} =`;
  const startIdx = stickmanContent.indexOf(startMarker);
  if (startIdx === -1) {
    console.error(`Could not find method ${name}`);
    return '';
  }

  let braceCount = 0;
  let started = false;
  let endIdx = -1;

  for (let i = startIdx; i < stickmanContent.length; i++) {
    if (stickmanContent[i] === '{') {
      braceCount++;
      started = true;
    } else if (stickmanContent[i] === '}') {
      braceCount--;
    }

    if (started && braceCount === 0) {
      const nextChar = stickmanContent[i + 1];
      if (nextChar === ';' || nextChar === '\n' || nextChar === '\r') {
        endIdx = i + (nextChar === ';' ? 2 : 1);
      } else {
        endIdx = i + 1;
      }
      break;
    }
  }

  if (endIdx === -1) return '';
  return stickmanContent.substring(startIdx, endIdx).trim();
}

const methodsToExtract = [
  'getClothesColor',
  'renderBackHair',
  'renderTail',
  'renderHat',
  'renderFaceAccessories',
  'renderBehindClothes',
  'renderFrontBackAccessories',
  'renderUpper',
  'renderLower',
  'renderLeftBoot',
  'renderRightBoot'
];

let extractedMethods = methodsToExtract.map(m => {
  let code = extractMethod(m);
  if (m === 'renderLeftBoot' || m === 'renderRightBoot') {
    code = code.replace('(bootType: string,', '(bootType: string | null,');
  }
  return code;
}).join('\n\n  ');

const allInjectedMethods = extractedMethods;

let updatedAnimated = animatedContent;

const constantsToUpdate = [
  {
    name: 'hasHat',
    regex: /const hasHat = [^;]+;/,
    replacement: "const hasHat = !!(equipped.hair && (equipped.hair.startsWith('hat-') || equipped.hair.startsWith('hair-')));"
  },
  {
    name: 'hasGlasses',
    regex: /const hasGlasses = [^;]+;/,
    replacement: "const hasGlasses = !!(equipped.face && (equipped.face.startsWith('glasses-') || equipped.face.startsWith('face-')));"
  },
  {
    name: 'hasTail',
    regex: /const hasTail = [^;]+;/,
    replacement: "const hasTail = !!equipped.tail;"
  },
  {
    name: 'hasUpper',
    regex: /const hasUpper = [^;]+;/,
    replacement: "const hasUpper = !!equipped.upper;"
  },
  {
    name: 'hasLower',
    regex: /const hasLower = [^;]+;/,
    replacement: "const hasLower = !!equipped.lower;"
  }
];

constantsToUpdate.forEach(c => {
  if (updatedAnimated.match(c.regex)) {
    updatedAnimated = updatedAnimated.replace(c.regex, c.replacement);
  } else {
    // If not found, inject it after equipped definition
    updatedAnimated = updatedAnimated.replace(
      "const equipped = useGameState((state) => state.equippedAccessories);",
      `const equipped = useGameState((state) => state.equippedAccessories);\n  ${c.replacement}`
    );
  }
});

const startBlock = "// --- START ACCESSORY METHODS ---";
const endBlock = "// --- END ACCESSORY METHODS ---";

let finalContent;
if (updatedAnimated.includes(startBlock)) {
  const parts = updatedAnimated.split(startBlock);
  const endParts = parts[1].split(endBlock);
  finalContent = parts[0] + startBlock + '\n  ' + allInjectedMethods + '\n  ' + endBlock + endParts[1];
} else {
  const injectionPoint = "const getClothesColor = () =>";
  const injectionEnd = "const bodyCol = '#2D3436';";

  if (updatedAnimated.includes(injectionPoint)) {
    const startIdx = updatedAnimated.indexOf(injectionPoint);
    const endIdx = updatedAnimated.indexOf(injectionEnd);
    finalContent = updatedAnimated.substring(0, startIdx) +
      startBlock + '\n  ' +
      allInjectedMethods + '\n  ' +
      endBlock + '\n  ' +
      updatedAnimated.substring(endIdx);
  } else {
    process.exit(1);
  }
}

// Safer replacements in the JSX
finalContent = finalContent.replace(/{renderBalloons\(\)}/g, '');

if (!finalContent.includes('{renderTail()}')) {
  finalContent = finalContent.replace('{renderBehindClothes()}', '{renderBehindClothes()}{renderTail()}');
}
// Specific marker for back hair: target the head circle circle
if (!finalContent.includes('{renderBackHair()}')) {
  finalContent = finalContent.replace('{/* Head Circle */}<Circle', '{/* Head Circle */}{renderBackHair()}<Circle');
}

// Fix clipping for dragon helmet (viewBox and height expansion)
finalContent = finalContent.replace(
  'style={[{ width: size, height: size }, styles.container]}',
  'style={[{ width: size, height: size * 1.3 }, styles.container]}'
);
finalContent = finalContent.replace(
  /width=\{size\} height=\{size\} viewBox=\{`0 0 \$\{size\} \$\{size\}`\}/g,
  'width={size} height={size * 1.3} viewBox={`0 ${-size * 0.2} ${size} ${size * 1.3}`}'
);

fs.writeFileSync(animatedPath, finalContent);
console.log("Patched AnimatedStickman.tsx successfully!");

const fs = require('fs');

const stickman = fs.readFileSync('components/Stickman.tsx', 'utf8');
let animated = fs.readFileSync('components/AnimatedStickman.tsx', 'utf8');

// 1. Extract accessory rendering methods from Stickman.tsx
const extractMethod = (methodName) => {
    const startIdx = stickman.indexOf(`const ${methodName} =`);
    if (startIdx === -1) return null;
    let braceCount = 0;
    let endIdx = -1;
    let started = false;
    for (let i = startIdx; i < stickman.length; i++) {
        if (stickman[i] === '{') { started = true; braceCount++; }
        else if (stickman[i] === '}') { braceCount--; }
        if (started && braceCount === 0) { endIdx = i + 1; break; }
    }
    return stickman.substring(startIdx, endIdx);
};

const renderUpper = extractMethod('renderUpper');
const renderLower = extractMethod('renderLower');
const renderBehindClothes = extractMethod('renderBehindClothes');
const renderLeftBoot = extractMethod('renderLeftBoot');
const renderRightBoot = extractMethod('renderRightBoot');
const renderHat = extractMethod('renderHat');
const renderGlasses = extractMethod('renderGlasses');
const renderFrontBackAccessories = extractMethod('renderFrontBackAccessories');

// Make boot functions accept arguments to work in AnimatedStickman
const fixFunctionArgs = (code, isLeft) => {
    let replaced = code.replace(/const render(Left|Right)Boot = \(\) => {/, "const render$1Boot = (bootType: string, x: number, y: number, bootW: number, bootH: number) => {\n    if (!bootType) return null;\n");
    replaced = replaced.replace(/equipped\.shoes/g, "bootType");
    return replaced;
};

// 2. We will inject these functions into AnimatedStickman.tsx
// First, find the place to inject them (around line 120)
// Replace existing getClothesColor, renderLeftBoot, renderRightBoot block

const injectStart = animated.indexOf('const getClothesColor = () => {');
const injectEnd = animated.indexOf('const bodyCol = \'#2D3436\';');

if (injectStart !== -1 && injectEnd !== -1) {
    const injection = `
  const getClothesColor = () => {
    if (equipped.upper === 'shirt-2') return "#4CAF50";
    if (equipped.upper === 'shirt-3') return "#9C27B0";
    if (equipped.upper === 'shirt-4') return "#F8BBD0";
    if (equipped.lower === 'shirt-5') return "#F06292";
    if (equipped.lower === 'lower-3') return "#673AB7";
    return bodyCol;
  };
    
  ${renderUpper}
  ${renderLower}
  ${renderBehindClothes.replace(/const renderBehindClothes = \(\) => {/, 'const renderBehindClothes = () => {\n    if (!hasBack) return null;\n')}
  ${renderFrontBackAccessories}
  ${renderHat}
  ${renderGlasses}
  ${fixFunctionArgs(renderLeftBoot, true)}
  ${fixFunctionArgs(renderRightBoot, false)}

`;
    animated = animated.substring(0, injectStart) + injection + animated.substring(injectEnd);
}

// 3. Update the constants like hasHat, hasBoots to support the new IDs
animated = animated.replace(/const hasGlasses = .*/, `const hasGlasses = equipped.face === 'glasses-1' || equipped.face === 'glasses-2' || equipped.face === 'glasses-3' || (equipped.face && equipped.face.startsWith('face-'));`);
animated = animated.replace(/const hasBoots = .*/, `const hasBoots = equipped.shoes && equipped.shoes.startsWith('shoes-');`);
animated = animated.replace(/const hasHat = .*/, `const hasHat = equipped.hair === 'hat-robot' || equipped.hair === 'hat-1' || equipped.hair === 'hat-2' || equipped.hair === 'hat-3' || equipped.hair === 'hat-4' || (equipped.hair && equipped.hair.startsWith('hair-'));`);

// 4. Update the JSX references. We will replace the inline rendering in AnimatedStickman with calls to these functions.
// Back stuff: Behind Clothing Layer
const behindClothingMatch = animated.indexOf('{hasBack && (');
if (behindClothingMatch !== -1) {
    const endBehind = animated.indexOf('</Svg>', behindClothingMatch);
    animated = animated.substring(0, behindClothingMatch) + '{renderBehindClothes()}\n        ' + animated.substring(endBehind);
}

// Front clothing stuff: Torso layer
const frontClothingStart = animated.indexOf('{/* Lower Body Clothing */}');
if (frontClothingStart !== -1) {
    const frontClothingEnd = animated.indexOf('</Svg>', frontClothingStart);
    animated = animated.substring(0, frontClothingStart) + `
        {renderLower()}
        {renderUpper()}
        {renderFrontBackAccessories()}
      ` + animated.substring(frontClothingEnd);
}

// Legs
animated = animated.replace(/{renderLeftBoot\(cx - legLen \* 0\.5, bodyBot \+ legLen, size \* 0\.06, size \* 0\.04\)}/g, 
  `{renderLeftBoot(equipped.shoes, cx - legLen * 0.5, bodyBot + legLen, size * 0.06, size * 0.04)}`);
animated = animated.replace(/{renderRightBoot\(cx \+ legLen \* 0\.5, bodyBot \+ legLen, size \* 0\.06, size \* 0\.04\)}/g, 
  `{renderRightBoot(equipped.shoes, cx + legLen * 0.5, bodyBot + legLen, size * 0.06, size * 0.04)}`);

// Head stuff
const hatStart = animated.indexOf('{/* Accessories */}');
if (hatStart !== -1) {
    const hatEnd = animated.indexOf('</Svg>', hatStart);
    animated = animated.substring(0, hatStart) + `
            {equipped.hair !== 'hat-robot' && renderGlasses()}
            {renderHat()}
         ` + animated.substring(hatEnd);
}

// Wrap head elements to hide faces when 'hat-robot' is on
const headEyesStart = animated.indexOf(' {/* Eyes */}');
if (headEyesStart !== -1) {
    // Hide native face elements if robot helmet is on
    const replaceTarget = animated.substring(headEyesStart, animated.indexOf('{/* Accessories', headEyesStart));
    animated = animated.replace(replaceTarget, `{equipped.hair !== 'hat-robot' && (<G>${replaceTarget}</G>)}`);
}

fs.writeFileSync('components/AnimatedStickman.tsx', animated, 'utf8');
console.log('Successfully patched AnimatedStickman.tsx');

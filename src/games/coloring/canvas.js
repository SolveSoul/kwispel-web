function normalizeHex(hex) {
  return hex.replace(/^#/, '');
}

export function hexToRgba(hex) {
  let normalized = normalizeHex(hex);

  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return [r, g, b, 255];
}

function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function isWithinTolerance(data, index, target, tolerance) {
  return (
    Math.abs(data[index] - target[0]) <= tolerance &&
    Math.abs(data[index + 1] - target[1]) <= tolerance &&
    Math.abs(data[index + 2] - target[2]) <= tolerance &&
    Math.abs(data[index + 3] - target[3]) <= tolerance
  );
}

export function floodFill(paintImage, outlineImage, startX, startY, fillColor, tolerance) {
  const { data, width, height } = paintImage;

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const startIndex = (startY * width + startX) * 4;
  const targetColor = [data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]];

  if (colorsMatch(targetColor, fillColor)) {
    return false;
  }

  const visited = new Uint8Array(width * height);
  const stack = [startX, startY];
  let changed = false;

  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();

    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }

    const offset = y * width + x;

    if (visited[offset] === 1) {
      continue;
    }

    visited[offset] = 1;

    const dataIndex = offset * 4;

    if (!isWithinTolerance(data, dataIndex, targetColor, tolerance)) {
      continue;
    }

    if (outlineImage && outlineImage.data[dataIndex + 3] > 70) {
      continue;
    }

    data[dataIndex] = fillColor[0];
    data[dataIndex + 1] = fillColor[1];
    data[dataIndex + 2] = fillColor[2];
    data[dataIndex + 3] = fillColor[3];
    changed = true;

    stack.push(x + 1, y);
    stack.push(x - 1, y);
    stack.push(x, y + 1);
    stack.push(x, y - 1);
  }

  return changed;
}

export function drawPlaceholderGuide(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const stroke = 'rgba(47, 42, 40, 0.92)';
  const lineWidth = Math.max(width, height) * 0.008 + 4;

  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = stroke;

  // Body outline
  ctx.beginPath();
  ctx.moveTo(width * 0.24, height * 0.66);
  ctx.quadraticCurveTo(width * 0.24, height * 0.45, width * 0.38, height * 0.42);
  ctx.quadraticCurveTo(width * 0.5, height * 0.28, width * 0.62, height * 0.42);
  ctx.quadraticCurveTo(width * 0.76, height * 0.45, width * 0.76, height * 0.65);
  ctx.quadraticCurveTo(width * 0.77, height * 0.83, width * 0.5, height * 0.86);
  ctx.quadraticCurveTo(width * 0.23, height * 0.82, width * 0.24, height * 0.66);
  ctx.closePath();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.43, width * 0.18, height * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left ear
  ctx.beginPath();
  ctx.ellipse(width * 0.4, height * 0.29, width * 0.1, height * 0.16, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.28, width * 0.1, height * 0.17, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Eye shapes
  const eyeRadius = width * 0.028;
  ctx.beginPath();
  ctx.ellipse(width * 0.45, height * 0.41, eyeRadius, eyeRadius * 1.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.55, height * 0.41, eyeRadius, eyeRadius * 1.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Muzzle
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.5, width * 0.12, height * 0.08, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.49);
  ctx.lineTo(width * 0.5, height * 0.56);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.56);
  ctx.quadraticCurveTo(width * 0.58, height * 0.61, width * 0.63, height * 0.56);
  ctx.moveTo(width * 0.5, height * 0.56);
  ctx.quadraticCurveTo(width * 0.42, height * 0.61, width * 0.37, height * 0.56);
  ctx.stroke();

  // Cheek patches
  ctx.beginPath();
  ctx.ellipse(width * 0.4, height * 0.48, width * 0.07, height * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.48, width * 0.07, height * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Collar and tag
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.61, width * 0.22, height * 0.07, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.65);
  ctx.lineTo(width * 0.5, height * 0.72);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.74, width * 0.05, height * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Belly patch
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.7, width * 0.16, height * 0.12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(width * 0.7, height * 0.58);
  ctx.quadraticCurveTo(width * 0.84, height * 0.52, width * 0.82, height * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width * 0.8, height * 0.42);
  ctx.quadraticCurveTo(width * 0.86, height * 0.37, width * 0.76, height * 0.34);
  ctx.stroke();

  // Paws guidance
  ctx.beginPath();
  ctx.moveTo(width * 0.36, height * 0.82);
  ctx.lineTo(width * 0.36, height * 0.88);
  ctx.moveTo(width * 0.42, height * 0.82);
  ctx.lineTo(width * 0.42, height * 0.88);
  ctx.moveTo(width * 0.58, height * 0.82);
  ctx.lineTo(width * 0.58, height * 0.88);
  ctx.moveTo(width * 0.64, height * 0.82);
  ctx.lineTo(width * 0.64, height * 0.88);
  ctx.stroke();

  // Ground details
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.9);
  ctx.quadraticCurveTo(width * 0.5, height * 0.94, width * 0.8, height * 0.9);
  ctx.stroke();

  ctx.restore();
}

export function drawRoundedRectPath(context, x, y, rectWidth, rectHeight, radius) {
  const clampedRadius = Math.max(0, Math.min(radius, Math.min(rectWidth, rectHeight) / 2));

  if (clampedRadius === 0) {
    context.rect(x, y, rectWidth, rectHeight);
    return;
  }

  const r = clampedRadius;
  context.moveTo(x + r, y);
  context.lineTo(x + rectWidth - r, y);
  context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
  context.lineTo(x + rectWidth, y + rectHeight - r);
  context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
  context.lineTo(x + r, y + rectHeight);
  context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

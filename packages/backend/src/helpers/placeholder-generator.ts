const WIDTH = 1200;
const HEIGHT = 900;
const ROWS = 6;
const COLS = 8;

const ACCENT_COLOURS = [
  "#001122",
  "#715DF2",
  "#6600FF",
  "#0066FF",
  "#4FACF7",
  "#009473",
  "#FCAF3C",
  "#F7770F",
  "#FF6F61",
  "#C62368",
  "#FF0066",
  "#A8A89E",
  "#888277",
  "#a2a2a2",
];

function jsf32(a: number, b: number, c: number, d: number) {
  a |= 0;
  b |= 0;
  c |= 0;
  d |= 0;
  var t = (a - ((b << 27) | (b >>> 5))) | 0;
  a = b ^ ((c << 17) | (c >>> 15));
  b = (c + d) | 0;
  c = (d + t) | 0;
  d = (a + t) | 0;
  return (d >>> 0) / 4294967296;
}

const BACKGROUND_COLOURS = ["#ffffff"];

const GenerateImage = (uuid: string): string => {
  let randomCount = { index: 0 };

  const accentColour =
    ACCENT_COLOURS[
      Math.floor(
        GenerateSequentialRandomNumbers(uuid, randomCount) *
          ACCENT_COLOURS.length
      )
    ];
  const backgroundColour =
    BACKGROUND_COLOURS[
      Math.floor(
        GenerateSequentialRandomNumbers(uuid, randomCount) *
          BACKGROUND_COLOURS.length
      )
    ];

  // generate x colours between the background and accent colours
  const colours = GenerateColours(backgroundColour, accentColour, 10);

  let paths = "";

  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const path = GenerateTriangle(x, y, colours, uuid, randomCount);
      paths += path;
    }
  }

  const svg = `
		<svg
			id="visual"
			viewBox="0 0 ${WIDTH} ${HEIGHT}"
			width="${WIDTH}"
			height="${HEIGHT}"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			version="1.1">
			<g stroke-width="1" stroke-linejoin="bevel">
				${paths}
			</g>
		</svg>`;

  return svg;
};

const GenerateTriangle = (
  x: number,
  y: number,
  colours: string[],
  uuid: string,
  randomCount: { index: number }
): string => {
  const width = WIDTH / COLS;
  const height = HEIGHT / ROWS;

  const colour1 =
    colours[
      Math.floor(
        GenerateSequentialRandomNumbers(uuid, randomCount) * colours.length
      )
    ];
  const colour2 =
    colours[
      Math.floor(
        GenerateSequentialRandomNumbers(uuid, randomCount) * colours.length
      )
    ];

  // split the square into 2 triangles
  // choose orientation
  const orientation = Math.floor(
    GenerateSequentialRandomNumbers(uuid, randomCount) * 2
  );

  // top left
  const x1 = x * width;
  const y1 = y * height;

  // top right
  const x2 = x1 + width;
  const y2 = y1;

  // bottom left
  const x3 = x1;
  const y3 = y1 + height;

  // bottom right
  const x4 = x2;
  const y4 = y3;

  // choose which triangle to use
  const triangle1 =
    orientation === 0
      ? `${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`
      : `${x1} ${y1} ${x2} ${y2} ${x4} ${y4}`;
  const triangle2 =
    orientation === 0
      ? `${x2} ${y2} ${x3} ${y3} ${x4} ${y4}`
      : `${x1} ${y1} ${x3} ${y3} ${x4} ${y4}`;

  return `
		<path d="M${triangle1}" fill="${colour1}" stroke="${colour1}"></path>
		<path d="M${triangle2}" fill="${colour2}" stroke="${colour2}"></path>
	`;
};

// generate x colours between the background and accent colours
const GenerateColours = (
  backgroundColour: string,
  accentColour: string,
  colours: number
): string[] => {
  const background = hexToRgb(backgroundColour);
  const accent = hexToRgb(accentColour);

  const coloursArray = [];

  for (let i = 0; i < colours; i++) {
    const colour = {
      r: Math.floor(background.r + (accent.r - background.r) * (i / colours)),
      g: Math.floor(background.g + (accent.g - background.g) * (i / colours)),
      b: Math.floor(background.b + (accent.b - background.b) * (i / colours)),
    };

    coloursArray.push(rgbToHex(colour));
  }

  return coloursArray;
};

// convert hex to rgb
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// convert rgb to hex
const rgbToHex = (rgb: { r: number; g: number; b: number }): string => {
  const r = rgb.r.toString(16).padStart(2, "0");
  const g = rgb.g.toString(16).padStart(2, "0");
  const b = rgb.b.toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
};

const GenerateSequentialRandomNumbers = (
  seed: string,
  randomCount: { index: number }
): number => {
  const parts = seed.split("-");
  // there are 5 parts

  const i = randomCount.index + 1;

  const index1 = i % 5;
  const index2 = Math.floor(i / 5) % 5;
  const index3 = Math.floor(i / 25) % 5;
  const index4 = Math.floor(i / 125) % 5;

  const a = parseInt(parts[index1], 16) * i;
  const b = parseInt(parts[index2], 16) * i;
  const c = parseInt(parts[index3], 16) * i;
  const d = parseInt(parts[index4], 16) * i;

  const random = jsf32(a, b, c, d);
  randomCount.index++;
  return random;
};

export default GenerateImage;

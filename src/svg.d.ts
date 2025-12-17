declare module '*.svg' {
  import type { FC, SVGProps } from 'react';

  const SVG: FC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

type SvgElement = FC<SVGProps<SVGSVGElement>>;

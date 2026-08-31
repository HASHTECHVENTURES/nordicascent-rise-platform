export type Partner = {
  name: string;
  href: string;
  logoSrc: string;
  /** White or dark-background logos need a dark container on light pages. */
  darkBg?: boolean;
};

export const PARTNERS: Partner[] = [
  {
    name: "GCE NODE",
    href: "https://gcenode.no/",
    logoSrc: "/partners/gce-node.svg",
    darkBg: true,
  },
  {
    name: "Lingu",
    href: "https://lingu.no/",
    logoSrc: "/partners/lingu.svg",
  },
  {
    name: "Offee",
    href: "https://offee.in/",
    logoSrc: "/partners/offee.png",
  },
];

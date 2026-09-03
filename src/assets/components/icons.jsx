/**
 * Inline stroke icons — Direction A.
 *
 * One drawing style throughout: a 24×24 grid, 1.5px strokes, round caps and
 * joins, no fills, `currentColor`. Size comes from the `size` prop (24 or 28
 * on the site) so the icons sit on the same optical grid as the type.
 * They are decorative next to a visible label, hence `aria-hidden`.
 */

function Svg({ size = 24, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Hotel bed — hospitality assets. */
export function BedIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2 4v16" />
      <path d="M2 9h18a2 2 0 0 1 2 2v9" />
      <path d="M2 17h20" />
      <path d="M6.5 9V6.6" />
    </Svg>
  );
}

/** Globe — national and international network. */
export function GlobeIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M2.8 12h18.4" />
      <path d="M12 2.8c2.4 2.6 3.6 5.7 3.6 9.2s-1.2 6.6-3.6 9.2c-2.4-2.6-3.6-5.7-3.6-9.2S9.6 5.4 12 2.8z" />
    </Svg>
  );
}

/** Two people — multidisciplinary teams. */
export function TeamIcon(props) {
  return (
    <Svg {...props}>
      <path d="M15.5 20.5v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.1a3.6 3.6 0 0 0-3.6 3.6v1.8" />
      <circle cx="9" cy="7.6" r="3.6" />
      <path d="M21.5 20.5v-1.8a3.6 3.6 0 0 0-2.7-3.5" />
      <path d="M15.8 4.2a3.6 3.6 0 0 1 0 6.9" />
    </Svg>
  );
}

/** Gavel — specialised legal advice. */
export function GavelIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 21h17" />
      <g transform="rotate(-42 12 11)">
        <rect x="7.6" y="2.6" width="8.8" height="4.4" />
        <path d="M12 7v10.4" />
        <path d="M8.4 17.4h7.2" />
      </g>
    </Svg>
  );
}

/** Handset. */
export function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21.5 16.9v2.9a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6 2 2 0 0 1 2-2.2h2.9a2 2 0 0 1 2 1.7c.13.95.36 1.88.7 2.77a2 2 0 0 1-.45 2.1L8.1 9.9a15.9 15.9 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.89.34 1.82.57 2.77.7a2 2 0 0 1 1.73 2.05z" />
    </Svg>
  );
}

/** Envelope. */
export function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="2.4" y="4.6" width="19.2" height="14.8" />
      <path d="m2.4 6 9.6 6.6L21.6 6" />
    </Svg>
  );
}

/** Speech bubble with a handset — WhatsApp. */
export function WhatsAppIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 11.6a8.5 8.5 0 0 1-12.4 7.6L3.4 20.6l1.5-5.1A8.5 8.5 0 1 1 21 11.6z" />
      <path d="M8.9 8.4c.3-.6.7-.6 1.1-.6h.4c.2 0 .4.1.6.6l.5 1.3c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.5 2.2c.3.1.4.1.6-.1l.5-.6c.2-.2.3-.2.6-.1l1.3.6c.3.1.4.3.4.5 0 .8-.6 1.5-1.4 1.6-.6.1-1.4 0-3-.8a8.5 8.5 0 0 1-3.6-3.5c-.5-1-.5-1.9-.2-2.5z" />
    </Svg>
  );
}

/** LinkedIn glyph, drawn as strokes to match the set. */
export function LinkedInIcon(props) {
  return (
    <Svg {...props}>
      <path d="M16.2 8.6a5.8 5.8 0 0 1 5.8 5.8v6.6h-3.9v-6.6a1.9 1.9 0 0 0-3.8 0v6.6h-3.9v-6.6a5.8 5.8 0 0 1 5.8-5.8z" />
      <rect x="2.4" y="9.2" width="3.9" height="11.8" />
      <circle cx="4.35" cy="4.4" r="2" />
    </Svg>
  );
}

/** Two-bar burger for the phone navigation. */
export function BurgerIcon({ size = 26 }) {
  return (
    <svg
      width={size}
      height={(size * 14) / 26}
      viewBox="0 0 26 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 3.5h24" />
      <path d="M1 10.5h24" />
    </svg>
  );
}

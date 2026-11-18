type P = { size?: number; className?: string };

function Svg({ size = 20, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {children}
    </svg>
  );
}

export const BasketIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 9h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 9Z" />
    <path d="m8.5 9 3.5-5 3.5 5M9.5 13v3M14.5 13v3" />
  </Svg>
);
export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);
export const PlusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const MinusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const TrashIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const PhoneIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Svg>
);
export const ChatIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 1 1 3.3 6.5L4 20l1.2-3.6A8 8 0 0 1 4 12Z" />
    <path d="m8 13 2.5-2.5 2.5 2 3-3" />
  </Svg>
);
export const MailIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="3" />
    <path d="m4 7.5 8 6 8-6" />
  </Svg>
);
export const TruckIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Svg>
);
export const PinIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
export const ArrowIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ShuffleIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 4.6C14.3 16 15.5 17 17.5 17H21M18 14l3 3-3 3M3 17h3.5c1.4 0 2.4-.5 3.2-1.4M21 7h-3.5c-1.4 0-2.4.5-3.2 1.4M18 4l3 3-3 3" />
  </Svg>
);
export const MenuIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);
export const CloseIcon = (p: P) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);
export const SparkIcon = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" className={p.className} aria-hidden>
    <path d="M12 1.5c.6 4.9 2.7 7.6 9.5 10.5-6.8 2.9-8.9 5.6-9.5 10.5-.6-4.9-2.7-7.6-9.5-10.5C9.3 9.1 11.4 6.4 12 1.5Z" fill="currentColor" />
  </svg>
);
export const FacebookIcon = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" className={p.className} aria-hidden>
    <path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
  </svg>
);
export const InstagramIcon = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.8" cy="7.2" r=".6" fill="currentColor" />
  </Svg>
);
export const YoutubeIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" />
  </Svg>
);
export const DeviceIcon = (p: P) => (
  <Svg {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
    <rect x="8.6" y="4.8" width="3.4" height="3.4" rx="1" />
  </Svg>
);
export const MagnetIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 4h4v7a2 2 0 0 0 4 0V4h4v7a6 6 0 0 1-12 0V4Z" />
    <path d="M6 8h4M14 8h4" />
  </Svg>
);
export const TiktokIcon = (p: P) => (
  <Svg {...p}>
    <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 4c.4 2.5 2 4 4.5 4.2" />
  </Svg>
);
export const ClockIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const GiftIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="8.5" width="17" height="4" />
    <path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5S10.5 4 8 4.5 7.5 8.5 12 8.5ZM12 8.5S13.5 4 16 4.5s.5 4-4 4Z" />
  </Svg>
);
export const ScissorsIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="6" cy="17.5" r="2.5" />
    <path d="M8 8 20 18M8 16 20 6" />
  </Svg>
);
export const TieIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 3h5l-1 3h-3l-1-3ZM10.5 6 8.5 16l3.5 5 3.5-5-2-10" />
  </Svg>
);
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);
export const UserIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c.9-3.6 3.6-5.4 7-5.4s6.1 1.8 7 5.4" />
  </Svg>
);
export const EyeIcon = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);
export const ChevronIcon = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const DropIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5S6.5 10 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" />
  </Svg>
);

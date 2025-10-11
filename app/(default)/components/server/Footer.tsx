export interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`bg-black/10 backdrop-blur-sm text-white w-full p-2.5 absolute bottom-0 left-0 right-0 z-10 border-t border-white/20 ${className}`}
    >
      <div className="text-center">
        <p className="text-sm">
          © 2025 Phoenix Sound. All rights reserved. Site by{" "}
          <a href="https://www.fresneldigital.com">Fresnel Digital Pty Ltd</a>
        </p>
      </div>
    </footer>
  );
}

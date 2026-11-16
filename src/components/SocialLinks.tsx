const socials = [
  {
    name: "Facebook",
    key: "FACEBOOK",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z",
  },
  {
    name: "Instagram",
    key: "INSTAGRAM",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  },
  {
    name: "TikTok",
    key: "TIKTOK",
    path: "M16.6 2c.4 2.6 1.8 4.2 4.4 4.4v3.2a8.1 8.1 0 0 1-4.4-1.3v7.1A6.6 6.6 0 1 1 10.9 9v3.4a3.3 3.3 0 1 0 2.3 3.1V2Z",
  },
];
export function SocialLinks() {
  return (
    <div className="footer-socials">
      {socials.map((s) => {
        const content = (
          <>
            <span className="footer-social-icon">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d={s.path} />
              </svg>
            </span>
            <span>{s.name}</span>
          </>
        );
        return (
          <span
            key={s.key}
            className="footer-social-pending"
            aria-label={s.name}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}

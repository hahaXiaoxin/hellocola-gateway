function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50/80">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-2">
        <p className="text-sm text-gray-400">
          <span className="font-semibold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            {__SITE_CONFIG__.site.name}
          </span>
          {' '}· {__SITE_CONFIG__.site.subtitle}
        </p>
        <p className="text-xs text-gray-300">
          &copy; {currentYear} {__SITE_CONFIG__.site.copyright}. 保留所有权利。
        </p>
        {__SITE_CONFIG__.icp.code && (
          <a
            href={__SITE_CONFIG__.icp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
          >
            {__SITE_CONFIG__.icp.code}
          </a>
        )}
      </div>
    </footer>
  );
}

export default Footer;

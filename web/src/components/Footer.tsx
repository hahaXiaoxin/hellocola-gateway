function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50/80">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-2">
        <p className="text-sm text-gray-400">
          由{' '}
          <span className="font-semibold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            HelloCola Gateway
          </span>
          {' '}驱动
        </p>
        <p className="text-xs text-gray-300">
          &copy; {currentYear} HelloCola. 保留所有权利。
        </p>
      </div>
    </footer>
  );
}

export default Footer;

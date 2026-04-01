interface SiteConfig {
  site: {
    name: string;
    title: string;
    description: string;
    subtitle: string;
    welcomeText: string;
    heroDescription: string;
    copyright: string;
  };
  links: {
    github: string;
    [key: string]: string;
  };
  features: Array<{
    icon: string;
    label: string;
    color: string;
  }>;
  icp: {
    code: string;
    url: string;
  };
}

declare const __SITE_CONFIG__: SiteConfig;

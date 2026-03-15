import config from '../../site.config.json';

export interface SiteConfig {
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
}

export const siteConfig: SiteConfig = config;

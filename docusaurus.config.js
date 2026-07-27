const config = {
  title: 'Restaurant OS Documentation',
  tagline: 'Product, architecture, security, integrations, and delivery blueprint',
  favicon: 'img/favicon.svg',
  url: 'https://autodidactcrew.github.io',
  baseUrl: '/restaurant-os-docs/',
  organizationName: 'AutodidactCrew',
  projectName: 'restaurant-os-docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  markdown: {mermaid: true},
  themes: ['@docusaurus/theme-mermaid'],
  presets: [[
    'classic',
    {
      docs: {
        sidebarPath: require.resolve('./sidebars.js'),
        routeBasePath: '/',
        editUrl: 'https://github.com/autodidactcrew/restaurant-os-docs/edit/main/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true
      },
      blog: false,
      theme: {customCss: require.resolve('./src/css/custom.css')}
    }
  ]],
  themeConfig: {
    navbar: {
      title: 'Restaurant OS',
      logo: {alt: 'Restaurant OS', src: 'img/logo.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'mainSidebar', position: 'left', label: 'Documentation'},
        {href: 'https://github.com/autodidactcrew/restaurant-os-docs', label: 'GitHub', position: 'right'}
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Core', items: [{label: 'Product Requirements', to: '/product-requirements/overview'}, {label: 'Architecture', to: '/solution-architecture/overview'}]},
        {title: 'Engineering', items: [{label: 'Security', to: '/security/overview'}, {label: 'Device Integrations', to: '/device-integrations/overview'}]}
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Restaurant OS.`
    },
    colorMode: {defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true},
    mermaid: {theme: {light: 'neutral', dark: 'dark'}}
  }
};
module.exports = config;

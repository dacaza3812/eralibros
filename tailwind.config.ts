const config = {
  theme: {
    extend: {
      colors: {
        boneParchment: '#f8f8f6',
        paperWhite: '#ffffff',
        softStone: '#efeeeb',
        carbonInk: '#121212',
        graphite: '#373734',
        ashen: '#7b7974',
        pebble: '#9c9a92',
        mist: '#b7b7b5',
        chalk: '#e7e6e1',
        obsidian: '#000000',
        clay: '#d97757',
      },
      fontFamily: {
        anthropicSerif: [
          '"Anthropic Serif"',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        anthropicSans: [
          '"Anthropic Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        caption: '11px',
        body: '14px',
        'heading-sm': '24px',
        heading: '30px',
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '64': '64px',
        '80': '80px',
        '96': '96px',
      },
      borderRadius: {
        nav: '8px',
        cards: '16px',
        inputs: '8px',
        buttons: '8px',
        'elevated-cards': '24px',
      },
      boxShadow: {
        lg: 'rgba(0, 0, 0, 0.04) 0px 4px 20px 0px',
        'lg-2': 'oklab(0.431435 -0.02915 -0.125723 / 0.1) 0px 4px 24px 0px',
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
};

export default config;
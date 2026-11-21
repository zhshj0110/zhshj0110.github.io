// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },
  {
    id: "nav-publications",
    title: "Publications",
    section: "Navigation",
    handler: () => {
      window.location.href = "/#publications";
    },
  },{id: "nav-cv",
          title: "CV",
          description: "Curriculum vitae of Shaojie Zhang.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-two-papers-have-been-accepted-by-eccv-2026",
          title: '🎉 Two papers have been accepted by ECCV 2026.',
          description: "",
          section: "News",},{id: "news-the-technical-report-of-xiaomi-gui-0-has-been-released",
          title: '🎉 The technical report of Xiaomi-GUI-0 has been released.',
          description: "",
          section: "News",},{id: "news-the-technical-report-of-xiaomi-ocr-0-has-been-released",
          title: '🎉 The technical report of Xiaomi-OCR-0 has been released.',
          description: "",
          section: "News",},{id: "news-the-technical-report-of-xiaomi-lens-0-has-been-released",
          title: '🎉 The technical report of Xiaomi-Lens-0 has been released.',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%7A%73%6A@%62%75%70%74.%65%64%75.%63%6E", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/zhshj0110", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=kcZH8esAAAAJ", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];

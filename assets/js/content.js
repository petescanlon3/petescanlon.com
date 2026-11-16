/*
 * Site content: projects, case studies, testimonials and logos.
 * Edit here; layout and motion code read from this file.
 */
window.SITE = {
  email: "pete@instead.studio",
  linkedin: "https://www.linkedin.com/in/petescanlon",

  // Work index, in the PDF's order. Labels are preserved from the work slide.
  projects: [
    { slug: "bleacher-report", title: "Bleacher Report", label: "Positioning + Brand Campaign",
      thumb: "case/bleacher-report/br-thumbnail.webp", thumbPos: "50% 50%" },
    { slug: "san-jose-earthquakes", title: "San Jose Earthquakes (MLS)", label: "Brand Actions Playbook",
      thumb: "case/san-jose-earthquakes/sjq-cover.webp", thumbPos: "50% 35%" },
    { slug: "glenfiddich-aston-martin-f1", title: "Glenfiddich x Aston Martin F1", label: "Brand Partnership Activation",
      thumb: "case/glenfiddich-x-aston-martin-f1/glenfiddich-cover-image.webp", thumbPos: "50% 45%" },
    { slug: "google-pixel-childish-gambino", title: "Google Pixel x Childish Gambino", label: "Influencer Collab + Activation",
      thumb: "case/google-pixel-x-childish-gambino/pixel-gambino.webp", thumbPos: "50% 28%" },
    { slug: "bodyarmor-nhl", title: "BodyArmor x NHL", label: "Brand Partnership Activation",
      thumb: "case/bodyarmor-x-nhl/bodyarmor-cover.webp", thumbPos: "50% 45%" },
    { slug: "youtube-brandcast", title: "YouTube Brandcast", label: "Global Livestream Event",
      thumb: "case/youtube-brandcast/youtube-cover.webp", thumbPos: "50% 78%" },
    { slug: "amazon-web-services", title: "Amazon Web Services", label: "Global Sports Partnership Strategy",
      thumb: "case/locked-projects/aws.webp", thumbPos: "50% 40%", locked: true },
    { slug: "verizon-nhl", title: "Verizon x NHL", label: "Brand Partnership Activation",
      thumb: "case/locked-projects/verizon-nhl.webp", thumbPos: "50% 30%", locked: true },
    { slug: "google-nba", title: "Google x NBA", label: "Fan Insights & Creative Strategy",
      thumb: "case/locked-projects/google-tech-blue-basketball-collection.webp", thumbPos: "50% 55%", locked: true },
    { slug: "major-league-baseball", title: "Major League Baseball", label: "Fan Insights & Creative Strategy",
      thumb: "case/locked-projects/mlb-barrettsf.webp", thumbPos: "50% 50%", locked: true },
  ],

  /*
   * Case studies. media[0] is the full-width lead; the rest form the gallery,
   * shown at their natural proportions: one row, or rows of the sizes given in
   * `rows`. A media item is either { src } (image) or { video } (looping clip
   * converted from a supplied GIF); `crop` narrows a gallery item to that
   * width:height ratio, framed by `pos`.
   */
  cases: {
    "bleacher-report": {
      name: "Bleacher Report",
      headline: ["Reinvigorating the", "brand built for fans"],
      logo: { src: "case/bleacher-report/br-logo.webp", alt: "Bleacher Report" },
      media: [
        { video: "case/bleacher-report/br-header-image", pos: "50% 50%",
          alt: "Indiana players celebrating as a ball carrier is brought down on the field." },
        { src: "case/bleacher-report/br-still-1.webp",
          alt: "A collage of ecstatic Indiana fans around the national championship trophy." },
        { src: "case/bleacher-report/br-iu-crowd2.webp",
          alt: "A packed section of Indiana fans in red, celebrating." },
        { video: "case/bleacher-report/br-bonus-gif-option1",
          alt: "A montage of fans’ phone videos reacting to the game, around a TV showing the broadcast." },
      ],
      sections: [
        { h: "Challenge", p: "Founded in 2008, B/R is a household name in sports, reaching 200M+ followers across channels like House of Highlights and B/R Gridiron. But in a fast-moving, fragmented media landscape, fans needed a clearer reason to choose B/R over the surrounding noise." },
        { h: "Strategy", p: "As a brand built by fans, B/R’s strength comes from experiencing sports alongside them, fueling the conversation rather than dictating it. “Fans First” became the brand’s essence and guiding belief. The resulting creative platform, “Fans Make It Sports,” brought that belief to life, giving fans a starring role in the culture they’ve always helped create." },
      ],
    },
    "san-jose-earthquakes": {
      name: "San Jose Earthquakes",
      headline: ["Making the quake felt", "across NorCal"],
      logo: { src: "case/san-jose-earthquakes/sjq-logo.webp", alt: "San Jose Earthquakes", tall: true },
      media: [
        { video: "case/san-jose-earthquakes/sjq-dangle", pos: "50% 40%",
          alt: "San Jose Earthquakes players driving forward during a match." },
        { src: "case/san-jose-earthquakes/sjq-crunch.webp",
          alt: "A layered, Quakes-branded dessert in the stands during a night match." },
        { src: "case/san-jose-earthquakes/sjq-creator.webp",
          alt: "A content creator and an Earthquakes player walking and talking at the training ground." },
      ],
      sections: [
        { h: "Challenge", p: "For more than 50 years, the Earthquakes have built a club with deep roots and a distinct spirit. Longtime staff, players and supporters knew what made the Quakes special. But as the club has grown, instinct alone wasn’t enough. The challenge was transforming unwritten know-how into something every employee could act on with confidence." },
        { h: "Strategy", p: "I built a Brand Actions Playbook that translated the club’s strengths into clear behavior principles, practical tools and starter ideas. It gave every team and employee across the club a new way of working and a shared way of turning brand DNA into everyday action." },
        { h: "Impact", p: "The Earthquakes’ VP of Marketing is moving quickly to put the Playbook into practice, with multiple ideas slated for rollout." },
      ],
    },
    "glenfiddich-aston-martin-f1": {
      name: "Glenfiddich x Aston Martin F1",
      headline: ["Scottish heritage hits", "F1’s Miami Grand Prix"],
      logo: { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-amf1-logo.webp", alt: "Glenfiddich and Aston Martin Formula One Team" },
      media: [
        { src: "case/glenfiddich-x-aston-martin-f1/finalglenfiddichcover.webp", pos: "50% 60%",
          alt: "A hand holding an embroidered Glenfiddich Miami 2026 patch over Aston Martin green and lime racing fabric." },
        // Trimmed 10% from each side so it sits better beside the portrait shots.
        { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-hero-structure.webp", pos: "50% 55%", crop: 1.425,
          alt: "Guests walking toward the two-storey Glenfiddich hospitality structure at sunset during the Miami Grand Prix." },
        { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-racers.webp",
          alt: "Two guests in Aston Martin helmets and Glenfiddich racing jackets pointing at the camera." },
        { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-amber.webp",
          alt: "Close-up of swirling amber whisky." },
        { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-racecar.webp",
          alt: "The Aston Martin Formula One car at speed." },
        { src: "case/glenfiddich-x-aston-martin-f1/glenfiddich-orange-2.webp",
          alt: "A bottle of Glenfiddich 14 beside an orange cocktail at the hospitality bar." },
      ],
      sections: [
        { h: "Challenge", p: "The world's most awarded single malt Scotch whisky needed a way to bring the best of their 139-year heritage into the high-octane world of Formula 1 in collaboration with the Aston Martin F1 Team." },
        { h: "Strategy", p: "As part of Momentum Worldwide, I helped deliver an elevated experience and moment of triumph for this upwardly-mobile audience inspired by the innovative spirit, ambition, and relentless standards both brands demand." },
      ],
    },
    "google-pixel-childish-gambino": {
      name: "Google Pixel x Childish Gambino",
      headline: ["An exclusive look", "inside Gambino’s mind"],
      logo: { src: "case/google-pixel-x-childish-gambino/pixel-logo.webp", alt: "Google Pixel 3 and Childish Gambino" },
      media: [
        { video: "case/google-pixel-x-childish-gambino/coachellamini1", pos: "50% 75%",
          alt: "The stepped black ‘Brighter in the Dark’ installation against a clear blue sky." },
        { src: "case/google-pixel-x-childish-gambino/bonus-coachella1.webp", crop: 1.2,
          alt: "Festival-goers walking between two mirrored ‘Brighter in the Dark’ structures at sunset." },
        { src: "case/google-pixel-x-childish-gambino/pixel-gambino.webp", crop: 0.912, pos: "85% 50%",
          alt: "Childish Gambino performing on stage." },
        { src: "case/google-pixel-x-childish-gambino/bonus-coachella3.webp", crop: 1.2, pos: "38% 50%",
          alt: "A visitor silhouetted against blue light, holding up a Pixel 3 inside the installation." },
        // Shown in full; the Gambino photo above gives up its open left side to make room.
        { src: "case/google-pixel-x-childish-gambino/pixel-complex.webp",
          alt: "Complex coverage headlined ‘Exclusive: Childish Gambino Talks Bridging Art and Technology With Google at Coachella’, beside the Brighter in the Dark key art." },
      ],
      sections: [
        { h: "Challenge", p: "Google Pixel wanted to build cultural relevance among its core audience at one of America's noisiest cultural events: Coachella. But at a festival defined by creativity and self-expression, traditional product marketing can fall flat. Our challenge? Drive desire without adding to the noise." },
        { h: "Strategy", p: "We partnered with the event's headliner, Childish Gambino to create an immersive installation “Brighter in the Dark” that used Pixel 3 as a portal into his creative mind, unlocking content only the device could capture." },
        { h: "Impact", p: "Drove an 11% lift in purchase intent, 67% lift in social mentions, 26 press stories, and over 100M earned media impressions." },
      ],
    },
    "bodyarmor-nhl": {
      name: "BODYARMOR x NHL",
      credit: "Worked as Strategy Lead at Game Seven Agency",
      headline: ["The coldest game on earth", "meets the heat of Miami"],
      logo: { src: "case/bodyarmor-x-nhl/bodyarmour-nhl-logo.webp", alt: "BODYARMOR and NHL" },
      media: [
        { src: "case/bodyarmor-x-nhl/bodyarmor-cover.webp", pos: "50% 45%",
          alt: "An artist spray-painting a Winter Classic 2026 mural in Miami’s Wynwood district." },
        { src: "case/bodyarmor-x-nhl/bodyarmor-spray-paint.webp",
          alt: "Rows of colourful spray-paint cans, seen from above." },
        { video: "case/bodyarmor-x-nhl/bodyarmor-teaser",
          alt: "Teaser footage: a boombox and hockey gloves in low light." },
        { video: "case/bodyarmor-x-nhl/bodyarmor-biznasty", overlay: "case/bodyarmor-x-nhl/bodyarmor-biznasty-overlay.webp",
          alt: "Paul “Biznasty” Bissonnette filming a social video at the street hockey rink." },
        { src: "case/bodyarmor-x-nhl/bonus-bodyarmor2.webp",
          alt: "Zach Bell stickhandling a puck at the BODYARMOR street hockey rink in Wynwood." },
      ],
      sections: [
        { h: "Challenge", p: "As the official sports drink of the NHL, BODYARMOR had a major stage at the 2026 Winter Classic in Miami. But in a sponsorship landscape often defined by predictable, corporate activations, our client challenged us to create the brand's most talked-about moment of the year." },
        { h: "Strategy", p: "As part of Game Seven Agency, I helped reframe BODYARMOR from corporate sponsor to a brand that speaks the language and attitude of modern hockey culture. The output: a Wynwood experience blending street hockey, local artists, and player storytelling that reflects South Florida’s identity, featuring stick-handling phenom Zach Bell and amplified by fan favorite Paul “Biznasty” Bissonnette." },
      ],
    },
    "youtube-brandcast": {
      name: "YouTube Brandcast",
      headline: ["From streaming to", "the main stream"],
      logo: { src: "case/youtube-brandcast/youtube-logo.webp", alt: "YouTube" },
      media: [
        { video: "case/youtube-brandcast/youtube-intro", pos: "50% 0%",
          alt: "Hasan Minhaj seated on a sofa during the Brandcast show." },
        { src: "case/youtube-brandcast/youtube-miley.webp",
          alt: "Brandcast Delivered invitation reading ‘You’re invited’, featuring Miley Cyrus, May 4th, 2021." },
        { src: "case/youtube-brandcast/youtube-global.webp",
          alt: "World map showing Brandcast Delivered scaled across 26 markets." },
      ],
      sections: [
        { h: "Challenge", p: "Despite its enormous cultural influence, YouTube was still largely viewed by the advertising industry as a creator-first platform consumed on mobile and desktop. The challenge was to shift that perception and prove that YouTube belonged at the center of mainstream entertainment and culture." },
        { h: "Strategy", p: "We turned a powerful behavior shift into the central message: more than 120M people stream YouTube monthly on their TVs. “YouTube Is the Main Stream” came to life as a 45-minute, creator-powered show featuring talent like Hasan Minhaj and Johnny Harris, then scaled across 26 markets to maximize local relevance." },
        { h: "Impact", p: "Earned three Webby Award nominations and built a globally adaptable event platform that brought YouTube’s strength in streaming and mainstream culture to life." },
      ],
    },
  },

  // Kind words. `placeholder` quotes are stand-in text: replace before launch.
  testimonials: [
    { name: "Dave Liss", role: "GVP, Head of Strategy & Operations", org: "Bleacher Report (Warner Bros Discovery)",
      logo: "logos/rec/br-logo-white.webp",
      quote: "Pete is a phenomenal strategist. He came into an organization that had lacked a unified brand articulation for many years and quickly immersed himself in our internal initiatives and competitive landscape. He combined that insight with a deep understanding of fandom to reveal what makes Bleacher Report special and craft a brand strategy to chart our path forward." },
    { name: "Max Doblin", role: "VP, Creative Strategy", org: "Game Seven Agency (Excel Sports Mgt.)",
      // Hidden until Max's real quote arrives: paste it in as `quote` and delete `hidden: true`.
      logo: "logos/rec/gameseven.webp", placeholder: true, hidden: true,
      quote: "" }, // placeholder removed before launch so no stand-in text is published
    { name: "Nadia Roohparvar", role: "VP, Marketing", org: "San Jose Earthquakes (MLS)",
      logo: "logos/rec/sanjoseearthquakes.webp",
      quote: "Pete was quick to understand our brand DNA and what made us special as an organization. But he didn’t stop there. What made his work most impactful was his ability to take strategy that can get stuck in the abstract and translate it into clear, actionable behaviors to guide teams across the organization." },
  ],

  // Persistent logo bar: supplied white marks, shown in alphabetical order of
  // the name on the mark ([file, accessible name, sort name if different]).
  logos: [
    ["amex", "American Express"], ["android", "Android"], ["aws", "AWS"],
    ["bleacher-report-pure-white", "Bleacher Report"], ["bodyamor", "BODYARMOR"], ["canva", "Canva"],
    ["espolon", "Espolón"], ["f1", "F1"], ["glenfiddich", "Glenfiddich"], ["google", "Google"],
    ["marchmadness", "NCAA March Madness", "March Madness"], ["meta", "Meta"], ["mlb", "MLB"],
    ["nba", "NBA"], ["ncaa", "NCAA"], ["nfl", "NFL"], ["nhl", "NHL"], ["nvidia", "Nvidia"],
    ["prime", "Amazon Prime", "Prime"], ["ram", "Ram"], ["samsung", "Samsung"],
    ["sanjoseearthquakes", "San Jose Earthquakes"], ["spindrift", "Spindrift"], ["starbucks", "Starbucks"],
    ["uggformen", "UGG for Men"], ["ultabeauty", "Ulta Beauty"], ["verizon", "Verizon"],
    ["visible", "Visible"], ["wildturkey", "Wild Turkey"], ["wing", "Wing"],
    ["youtube", "YouTube"], ["zillow", "Zillow"],
  ],
};

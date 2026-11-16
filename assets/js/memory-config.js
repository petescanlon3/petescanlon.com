/*
 * COLLECTIVE MEMORY: assembly configuration.
 *
 * Each layout is a character map; one character = one grid cell. Repeated,
 * contiguous characters form one multi-cell photograph whose crop stays
 * continuous across its cells. "." leaves a cell black.
 *
 * tiles[char] = [image, focalX, focalY, cellsPerStep]
 *   image: a file in assets/img/memory (without .webp)
 *   focalX/focalY (0–1) position the crop; 0.5, 0.5 is centred
 *   cellsPerStep (optional): by default images of up to 3 cells appear in one
 *   step and larger ones fill in 2 cells at a time
 *
 * title [row0, col0, row1, col1]: the box the title is fitted into; titleLines 1 or 2.
 * The title starts solid white and fills with fragments of the finished mosaic
 * inside a white outline, completing before the first photograph appears.
 * dim [row0, row1]: photographs touching these rows are darkened, so the
 * question under the title stays readable.
 * origin [row, col]: photographs fill in by distance from this cell, unless an
 * explicit `order` string of tile characters is given.
 *
 * Scroll budget, in viewport heights of ordinary vertical scrolling:
 *   leadVh      the title settles before the first photograph appears
 *   assemblyVh  photographs assemble
 *   holdVh      the finished mosaic registers before the journey resumes
 *
 * Removed for noise: nebraska, olemiss. Not in the desktop strip: jj (too close to jj2).
 */
(function () {
  // A cinematic strip (17 x 7 square cells, about 2.4:1): 38 photographs, each used once.
  var mosaic = {
    map: [
      // 01234567890123456
      "AAABDDEEGHHHIILMM", // 0
      "AAACDDFFGHHHJKLMM", // 1
      "NNOOOQQSSSTTVVVXX", // 2
      "NNOOORRSSSTTWWWXX", // 3
      "NNPPPRRSSSUUWWWXX", // 4
      "YYZbbbddfgghhklll", // 5
      "YYaccceefggijklll", // 6
    ],
    tiles: {
      A: ["lambeauleap", 0.5, 0.5],
      B: ["to", 0.5, 0.25],
      C: ["ozzie", 0.5, 0.25],
      D: ["mia", 0.5, 0.3],
      E: ["knicksfans", 0.5, 0.5],
      F: ["sandiegoasg", 0.5, 0.5],
      G: ["kal", 0.5, 0.35],
      H: ["randy", 0.5, 0.4],
      I: ["billsmafia", 0.5, 0.15],
      J: ["iverson", 0.5, 0.25],
      K: ["jwill", 0.5, 0.3],
      L: ["torihunter", 0.1, 0.5],
      M: ["vince2", 0.5, 0.45],
      N: ["griffey", 0.5, 0.25],
      O: ["heisman", 0.5, 0.5],
      P: ["miamigrandprix", 0.5, 0.75],
      Q: ["brewers", 0.5, 0.5],
      R: ["kobeunfazed", 0.5, 0.4],
      S: ["vladandvlad", 0.5, 0.02],
      T: ["zion", 0.5, 0.3],
      U: ["fenway", 0.5, 0.5],
      V: ["wrigley", 0.5, 0.6],
      W: ["mjfinal", 0.6, 0.35],
      X: ["jj2", 0.5, 0.35],
      Y: ["thecup", 0.5, 0.5],
      Z: ["nomar", 0.5, 0.4],
      a: ["shoehei", 0.5, 0.35],
      b: ["losangeleskings", 0.5, 0.5],
      c: ["packers", 0.35, 0.4],
      d: ["cavs", 0.5, 0.4],
      e: ["knicksfans2", 0.5, 0.4],
      f: ["djmoore", 0.6, 0.5],
      g: ["brady", 0.5, 0.4],
      h: ["dodgers", 0.4, 0.5],
      i: ["lt", 0.5, 0.3],
      j: ["cmc", 0.5, 0.4],
      k: ["cubsfanforever", 0.5, 0.35],
      l: ["longhorns", 0.5, 0.4],
    },
    title: [2, 1, 4, 15],
    titleLines: 1,
    dim: [2, 4],
    origin: [3, 8],
    leadVh: 0.25,
    assemblyVh: 3.4,
    holdVh: 0.6,
  };

  window.MEMORY_CONFIG = {
    desktop: { mosaic: mosaic },
    // Phones and portrait tablets: fewer, larger cells; shorter sequence.
    mobile: {
      mosaic: {
        map: [
          // 012345
          "AAABCC", // 0
          "AAADCC", // 1
          "EFFDGG", // 2
          "EFFHGG", // 3
          "IIJHKK", // 4
          "IIJLKK", // 5
          "MNNLOO", // 6
          "MNNPOO", // 7
          "QQRPSS", // 8
          "QQRTSS", // 9
        ],
        tiles: {
          A: ["lambeauleap", 0.5, 0.5],
          B: ["randy", 0.5, 0.4],
          C: ["vince2", 0.5, 0.45],
          D: ["fenway", 0.5, 0.5],
          E: ["griffey", 0.5, 0.25],
          F: ["cubsfanforever", 0.5, 0.35],
          G: ["knicksfans", 0.5, 0.5],
          H: ["thecup", 0.5, 0.5],
          I: ["heisman", 0.5, 0.5],
          J: ["iverson", 0.5, 0.25],
          K: ["mjfinal", 0.65, 0.35],
          L: ["kobeunfazed", 0.5, 0.35],
          M: ["nomar", 0.5, 0.4],
          N: ["jj", 0.5, 0.4],
          O: ["longhorns", 0.5, 0.4],
          P: ["mia", 0.5, 0.3],
          Q: ["cmc", 0.5, 0.4],
          R: ["zion", 0.5, 0.3],
          S: ["torihunter", 0.3, 0.5],
          T: ["to", 0.5, 0.3],
        },
        title: [3, 0, 6, 5],
        titleLines: 2,
        dim: [4, 7],
        origin: [4.5, 2.5],
        leadVh: 0.4, // long enough for the title to fill before the first photograph
        assemblyVh: 1.6,
        holdVh: 0.4,
      },
    },
  };
})();

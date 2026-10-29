/**
 * Names for Random: famous fictional nations, and the nations that turn up in NationStates
 * issues. Each says where it comes from, so a rolled name gets its credit. Only the names are
 * borrowed; the governments Random gives them are its own.
 */
export interface FictionalName {
  name: string;
  from: string;
}

// From literature, film, television, comics, opera and theatre.
const fiction: FictionalName[] = [
  { name: 'Utopia', from: "Thomas More's Utopia (1516)" },
  { name: 'Lilliput', from: "Jonathan Swift's Gulliver's Travels (1726)" },
  { name: 'Blefuscu', from: "Jonathan Swift's Gulliver's Travels (1726)" },
  { name: 'Brobdingnag', from: "Jonathan Swift's Gulliver's Travels (1726)" },
  { name: 'Gerolstein', from: "Offenbach's operetta The Grand Duchess of Gerolstein (1867)" },
  { name: 'Erewhon', from: "Samuel Butler's novel Erewhon (1872)" },
  { name: 'Barataria', from: "Gilbert and Sullivan's opera The Gondoliers (1889)" },
  { name: 'Ruritania', from: "Anthony Hope's novel The Prisoner of Zenda (1894)" },
  { name: 'Graustark', from: "George Barr McCutcheon's novel Graustark (1901)" },
  { name: 'Costaguana', from: "Joseph Conrad's novel Nostromo (1904)" },
  { name: 'Pontevedro', from: "Lehár's operetta The Merry Widow (1905)" },
  { name: 'Freedonia', from: 'the Marx Brothers film Duck Soup (1933)' },
  { name: 'Sylvania', from: 'the Marx Brothers film Duck Soup (1933)' },
  { name: 'Syldavia', from: "Hergé's The Adventures of Tintin (1938)" },
  { name: 'Borduria', from: "Hergé's The Adventures of Tintin (1938)" },
  { name: 'San Theodoros', from: "Hergé's The Adventures of Tintin (1935)" },
  { name: 'Moronica', from: "the Three Stooges' You Nazty Spy! (1940)" },
  { name: 'Tomainia', from: "Charlie Chaplin's film The Great Dictator (1940)" },
  { name: 'Bacteria', from: "Charlie Chaplin's film The Great Dictator (1940)" },
  { name: 'Lower Slobbovia', from: "Al Capp's comic strip Li'l Abner (1946)" },
  { name: 'Oceania', from: "George Orwell's Nineteen Eighty-Four (1949)" },
  { name: 'Eastasia', from: "George Orwell's Nineteen Eighty-Four (1949)" },
  { name: 'Narnia', from: "C. S. Lewis's The Chronicles of Narnia (1950)" },
  { name: 'Carpathia', from: "Terence Rattigan's play The Sleeping Prince (1953)" },
  { name: 'Grand Fenwick', from: "Leonard Wibberley's novel The Mouse That Roared (1955)" },
  { name: 'Pottsylvania', from: 'The Rocky and Bullwinkle Show (1959)' },
  { name: 'San Lorenzo', from: "Kurt Vonnegut's novel Cat's Cradle (1963)" },
  { name: 'Latveria', from: 'Marvel Comics (1964)' },
  { name: 'Wakanda', from: 'Marvel Comics (1966)' },
  { name: 'Vulgaria', from: 'the film Chitty Chitty Bang Bang (1968)' },
  { name: 'Florin', from: "William Goldman's The Princess Bride (1973)" },
  { name: 'Guilder', from: "William Goldman's The Princess Bride (1973)" },
  { name: 'Markovia', from: 'DC Comics (1983)' },
  { name: 'Gilead', from: "Margaret Atwood's novel The Handmaid's Tale (1985)" },
  { name: 'Bialya', from: 'DC Comics (1987)' },
  { name: 'Zamunda', from: 'the film Coming to America (1988)' },
  { name: 'Elbonia', from: 'the comic strip Dilbert' },
  { name: 'Agrabah', from: "Disney's film Aladdin (1992)" },
  { name: 'Genovia', from: "Meg Cabot's The Princess Diaries (2000)" },
  { name: 'Qumar', from: 'the television series The West Wing' },
  { name: 'Equatorial Kundu', from: 'the television series The West Wing' },
  { name: 'Molvania', from: 'the spoof travel guide Molvania (2003)' },
  { name: 'Krakozhia', from: 'the film The Terminal (2004)' },
  { name: 'Absurdistan', from: "Gary Shteyngart's novel Absurdistan (2006)" },
  { name: 'Panem', from: "Suzanne Collins's The Hunger Games (2008)" },
  { name: 'Wadiya', from: 'the film The Dictator (2012)' },
  { name: 'Arendelle', from: "Disney's film Frozen (2013)" },
  { name: 'Zubrowka', from: "Wes Anderson's film The Grand Budapest Hotel (2014)" },
  { name: 'Sokovia', from: 'the film Avengers: Age of Ultron (2015)' },
  { name: 'Aldovia', from: 'the film A Christmas Prince (2017)' },
];

// Non-playable nations from NationStates issues, as listed on the NationStates wiki
// (nationstates.fandom.com/wiki/Non-Playable_Nations), which cites the NationStates forum.
const nationStates = [
  'Albionia',
  'Aldoustan',
  'Althaniq',
  'Ausonia',
  'Barria',
  'Bigtopia',
  'Blackacre',
  'Brancaland',
  'Brasilistan',
  'Cea-Dicee',
  'Copiluaca',
  'Dàguó',
  'East Calypso',
  'East Lebatuck',
  'Galliennes',
  'Gallopavia',
  'Gullivad',
  'Haptu',
  'Kawandaland',
  'Lilliputia',
  'Macronesia',
  'Manamana',
  'Marche Blanche',
  'Marche Noire',
  'Maxtopia',
  'Merovingia',
  'MMO Isle',
  'Moltevino',
  'Moltovea',
  'North Palisade',
  'Núi Và Sông',
  'Qaanpaluk',
  'Sacerdia',
  'San Vitenzo',
  'Savoiia',
  'Sekonlif',
  'Skandilund',
  'Smalltopia',
  'South Nobovindia',
  'South Palisade',
  'Stalclaft',
  'Subspais',
  'Tiquitaca',
  'West Calypso',
  'West Fedoriah',
  'Wezeltonia',
  'Zompaboodaland',
].map((name) => ({ name, from: 'NationStates issues' }));

export const fictionalNames: readonly FictionalName[] = [...fiction, ...nationStates];

export function randomName(next: () => number = Math.random): FictionalName {
  return fictionalNames[Math.floor(next() * fictionalNames.length)]!;
}

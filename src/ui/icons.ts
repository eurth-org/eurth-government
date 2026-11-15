import {
  faBookOpen,
  faBullhorn,
  faChessKing,
  faCity,
  faCoins,
  faEarthAmericas,
  faGavel,
  faHandshake,
  faObjectGroup,
  faPeopleGroup,
  faPersonMilitaryRifle,
  faScaleUnbalanced,
  faSitemap,
  faUserGroup,
  faUserLock,
  faUsersRectangle,
  faUserTie,
  faBuildingColumns,
  faBuildingShield,
  faChartPie,
  faGraduationCap,
  faHeartPulse,
  faHouse,
  faIndustry,
  faLeaf,
  faMasksTheater,
  faBullseye,
  faCheckToSlot,
  faCircleDot,
  faCircleExclamation,
  faCircleNodes,
  faCircleXmark,
  faCompass,
  faCrown,
  faDoorClosed,
  faDoorOpen,
  faDove,
  faFlag,
  faFlask,
  faGlobe,
  faHandHoldingHeart,
  faHandFist,
  faJetFighter,
  faLandmark,
  faLightbulb,
  faLock,
  faPeopleArrows,
  faPlaceOfWorship,
  faScaleBalanced,
  faScroll,
  faShareNodes,
  faShieldHalved,
  faSliders,
  faTriangleExclamation,
  faUser,
  faUsers,
  faWallet,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { AxisId } from '../model/axes';
import type { Family } from '../model/naming';
import type { BudgetId } from '../model/settings';

/** One icon per settings section. */
export const groupIcons: Record<string, IconDefinition> = {
  'The state': faGlobe,
  'Head of state': faCrown,
  Government: faLandmark,
  Legislature: faScroll,
  Elections: faCheckToSlot,
  'Courts and rulers': faScaleBalanced,
  Religion: faPlaceOfWorship,
  'Defence and borders': faShieldHalved,
  Budget: faChartPie,
};

/**
 * Eurth's forum category colours, as marks beside each section: the name of a colour token of
 * @eurth/style (--cat-teal and the rest). They colour icons and bars, never text or its ground.
 */
export const groupSwatches: Record<string, string> = {
  'The state': 'cat-teal',
  'Head of state': 'cat-blue',
  Government: 'cat-red',
  Legislature: 'cat-amber',
  Elections: 'cat-green',
  'Courts and rulers': 'cat-lime',
  Religion: 'cat-orange',
  'Defence and borders': 'cat-grey',
  Budget: 'cat-vermilion',
};

/**
 * Each budget area's icon, and the colour token of its part of the budget chart. Ten of the
 * suite's category colours, set out so that neighbours in the chart alternate between lighter
 * and darker (not only in hue, which red-green colour blindness can hide); every part also has
 * its name and its icon in the legend, so no part is told by colour alone.
 */
export const budgetStyle: Record<BudgetId, { icon: IconDefinition; colour: string }> = {
  budgetGeneral: { icon: faBuildingColumns, colour: 'cat-grey' },
  budgetDefence: { icon: faShieldHalved, colour: 'cat-red' },
  budgetOrder: { icon: faBuildingShield, colour: 'cat-sky' },
  budgetEconomy: { icon: faIndustry, colour: 'cat-silver' },
  budgetEnvironment: { icon: faLeaf, colour: 'cat-green' },
  budgetHousing: { icon: faHouse, colour: 'cat-cerulean' },
  budgetHealth: { icon: faHeartPulse, colour: 'cat-lime' },
  budgetCulture: { icon: faMasksTheater, colour: 'cat-orange' },
  budgetEducation: { icon: faGraduationCap, colour: 'cat-amber' },
  budgetSocial: { icon: faHandHoldingHeart, colour: 'cat-teal' },
};

/** The icon at each end of an axis: low, then high. */
export const axisIcons: Record<AxisId, [IconDefinition, IconDefinition]> = {
  participation: [faUser, faUsers],
  competition: [faLock, faPeopleArrows],
  checks: [faHandFist, faScaleBalanced],
  decentralisation: [faCircleDot, faCircleNodes],
  religion: [faFlask, faPlaceOfWorship],
  militarism: [faDove, faJetFighter],
  welfare: [faWallet, faHandHoldingHeart],
  openness: [faDoorClosed, faDoorOpen],
};

export const panelIcons = {
  name: faFlag,
  checks: faTriangleExclamation,
  why: faLightbulb,
  scales: faSliders,
  radar: faBullseye,
  compass: faCompass,
  share: faShareNodes,
  picker: faBookOpen,
};

export const severityIcons = {
  conflict: faCircleXmark,
  unusual: faCircleExclamation,
};

/** An icon for each naming rule, so a label's icon changes with the label. */
const ruleIcons: Record<Family, Record<string, IconDefinition>> = {
  structure: {
    'world-federation': faEarthAmericas,
    'world-confederation': faEarthAmericas,
    'world-state': faEarthAmericas,
    'federal-union': faHandshake,
    'confederation-of-states': faHandshake,
    'union-state': faObjectGroup,
    'federal-city-state': faCity,
    'confederal-city-state': faCity,
    'city-state': faCity,
    federation: faCircleNodes,
    confederation: faHandshake,
    'devolved-unitary-state': faSitemap,
    'unitary-state': faCircleDot,
  },
  system: {
    'direct-democratic': faPeopleGroup,
    directorial: faUsersRectangle,
    'semi-presidential': faUserGroup,
    'shared-executive': faUserGroup,
    parliamentary: faLandmark,
    presidential: faUserTie,
    'presidential-elected-leader': faUserTie,
    'parliamentary-executive-president': faLandmark,
    'presidential-with-prime-minister': faUserTie,
    'rule-by-head-of-state': faGavel,
  },
  form: {
    'theocratic-republic': faPlaceOfWorship,
    'hereditary-theocracy': faPlaceOfWorship,
    'elective-theocracy': faPlaceOfWorship,
    theocracy: faPlaceOfWorship,
    'elective-constitutional-monarchy': faCrown,
    'constitutional-monarchy': faCrown,
    'elective-semi-constitutional-monarchy': faCrown,
    'semi-constitutional-monarchy': faCrown,
    'elective-absolute-monarchy': faCrown,
    'absolute-monarchy': faCrown,
    'hereditary-republic': faChessKing,
    junta: faPersonMilitaryRifle,
    republic: faFlag,
  },
  regime: {
    'military-dictatorship': faPersonMilitaryRifle,
    'one-party-state': faBullhorn,
    theocracy: faPlaceOfWorship,
    dictatorship: faHandFist,
    'closed-autocracy': faLock,
    'nothing-to-elect': faLock,
    'electoral-autocracy': faScaleUnbalanced,
    'unelected-ruler': faScaleUnbalanced,
    'restricted-democracy': faUserLock,
    'restricted-candidacy': faUserLock,
    'direct-democracy': faPeopleGroup,
    'liberal-democracy': faScaleBalanced,
    'non-partisan-democracy': faPeopleGroup,
    'electoral-democracy-weak-courts': faGavel,
    'electoral-democracy': faCheckToSlot,
  },
  rulers: {
    anyone: faUsers,
    'party-members': faFlag,
    'clergy-under-religious-leader': faPlaceOfWorship,
    clergy: faPlaceOfWorship,
    military: faPersonMilitaryRifle,
    technocracy: faFlask,
    plutocracy: faCoins,
    'nobility-under-monarch': faChessKing,
    aristocracy: faChessKing,
    unrestricted: faUsers,
  },
};

export function ruleIcon(family: Family, rule: string): IconDefinition {
  return ruleIcons[family][rule] ?? faLightbulb;
}

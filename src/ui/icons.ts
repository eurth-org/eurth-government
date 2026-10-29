import {
  faBookOpen,
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

/** Eurth's forum category colours, as small swatches beside each section. */
export const groupSwatches: Record<string, string> = {
  'The state': '#12a89d',
  'Head of state': '#2698d4',
  Government: '#bf1e2e',
  Legislature: '#f7941d',
  Elections: '#3ab54a',
  'Courts and rulers': '#9eb83b',
  Religion: '#f1592a',
  'Defence and borders': '#808281',
  Budget: '#e45735',
};

/** Each budget area's icon, and its colour in the budget bar (Eurth's category colours). */
export const budgetStyle: Record<BudgetId, { icon: IconDefinition; colour: string }> = {
  budgetGeneral: { icon: faBuildingColumns, colour: '#808281' },
  budgetDefence: { icon: faShieldHalved, colour: '#bf1e2e' },
  budgetOrder: { icon: faBuildingShield, colour: '#0088cc' },
  budgetEconomy: { icon: faIndustry, colour: '#f7941d' },
  budgetEnvironment: { icon: faLeaf, colour: '#3ab54a' },
  budgetHousing: { icon: faHouse, colour: '#f1592a' },
  budgetHealth: { icon: faHeartPulse, colour: '#12a89d' },
  budgetCulture: { icon: faMasksTheater, colour: '#9eb83b' },
  budgetEducation: { icon: faGraduationCap, colour: '#25aae2' },
  budgetSocial: { icon: faHandHoldingHeart, colour: '#2698d4' },
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

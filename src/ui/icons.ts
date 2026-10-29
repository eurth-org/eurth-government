import {
  faBookOpen,
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
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { AxisId } from '../model/axes';

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
};

/** The icon at each end of an axis: low, then high. */
export const axisIcons: Record<AxisId, [IconDefinition, IconDefinition]> = {
  participation: [faUser, faUsers],
  competition: [faLock, faPeopleArrows],
  checks: [faHandFist, faScaleBalanced],
  decentralisation: [faCircleDot, faCircleNodes],
  religion: [faFlask, faPlaceOfWorship],
  militarism: [faDove, faJetFighter],
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

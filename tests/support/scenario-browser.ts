// Test-only factories for exact references in the browser's own math runtime.
// This entry point is never imported by the application.
export {createSnapshot} from '../../persistence';
export {createInitialWorld} from '../../world';
export {createScenarioWorld} from '../../environmentScenarios';
export {opticalScene} from './optical-scene';
export {restoreSnapshot} from '../../persistence';
export {stepSimulation} from '../../simulation';
export {auditWorldGrid} from '../../gridIntegrityAudit';
export {contactScene} from './contact-scene';

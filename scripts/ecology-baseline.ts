import {collectEcologyBaseline} from '../ecologyBaseline';
import {BUILD_VERSION} from '../persistence';

// Optional, repeatable, no UI or genome modification. Captures negative results too.
console.log(JSON.stringify({build:BUILD_VERSION,...collectEcologyBaseline()}, null, 2));

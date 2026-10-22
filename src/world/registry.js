import { PROPS } from "./props.js";
import { WORLD_PROPS } from "./propsWorld.js";
import { VN_PROPS } from "./propsVietnam.js";
import { DE_PROPS } from "./propsGermany.js";

/** Every procedural prop a map item can name with `prop: "<name>"`. */
export const ALL_PROPS = { ...PROPS, ...WORLD_PROPS, ...VN_PROPS, ...DE_PROPS };

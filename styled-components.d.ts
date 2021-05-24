// ./styled-components.d.ts
import { theme } from "./theme/Theme";

type CustomTheme = typeof theme;

declare module "styled-components" {
	export interface DefaultTheme extends CustomTheme {}
}

export interface ThemeProps {
	colors: {
		COLOR_DARK: string;
		COLOR_LIGHT: string;
		COLOR_ACADAMEDIA: string;
		COLOR_GRAY: string;
		COLOR_LIGHT_GRAY: string;
		COLOR_BORDER_GRAY: string;
		COLOR_SHADOW_GRAY: string;
		COLOR_COTTON_SEED: string;
		COLOR_RED: string;
		COLOR_SMOOTH_GRAY: string;
		COLOR_SEA_GREEN: string;
		COLOR_DEVIDER_GRAY: string
		COLOR_BLACK: string
	};

	font: string;

	fontSizes: {
		FONT_SIZE_XXXS: string;
		FONT_SIZE_XXS: string;
		FONT_SIZE_XS: string;
		FONT_SIZE_S: string;
		FONT_SIZE_M: string;
		FONT_SIZE_XMS: string;
		FONT_SIZE_XM: string;
		FONT_SIZE_L: string;
		FONT_SIZE_XL: string;
		FONT_SIZE_XXL: string;
	};

	fontWeight: {
		FONT_WEIGHT_LIGHT: string;
		FONT_WEIGHT_REGULAR: string;
		FONT_WEIGHT_MEDIUM: string;
		FONT_WEIGHT_BOLD: string;
		FONT_WEIGHT_EXTRA_BOLD: string;
	};

	fontFamily: {
		INTER: string;
	};

	spacing: {
		SPACING_ZERO: string;
		SPACING_XS: string;
		SPACING_S: string;
		SPACING_M: string;
		SPACING_XMS: string;
		SPACING_XML: string;
		SPACING_XM: string;
		SPACING_L: string;
		SPACING_XL: string;
		SPACING_XXL: string;
	};

	flexDirectionTypes: {
		ROW: string;
		COULUMN: string;
	};
}

export const theme: ThemeProps = {
	colors: {
		COLOR_DARK: "#333333",
		COLOR_LIGHT: "#FFF",
		COLOR_ACADAMEDIA: "#621558",
		COLOR_COTTON_SEED: "#B5B4B2",
		COLOR_RED: "#FF0000",
		COLOR_GRAY: "#C4C4C4",
		COLOR_LIGHT_GRAY: "#FAFAFA",
		COLOR_SHADOW_GRAY: "#E6E6E6",
		COLOR_SMOOTH_GRAY: "#F2F2F2",
		COLOR_SEA_GREEN: "#30B9A7",
		COLOR_DEVIDER_GRAY: "#ECECEC",
		COLOR_BORDER_GRAY: "#E5E5E5",
		COLOR_BLACK:"#000000"
	},

	font: "Inter",

	fontSizes: {
		FONT_SIZE_XXXS: "12px",
		FONT_SIZE_XXS: "13px",
		FONT_SIZE_XS: "14px",
		FONT_SIZE_S: "16px",
		FONT_SIZE_M: "18px",
		FONT_SIZE_XMS: "20px",
		FONT_SIZE_XM: "22px",
		FONT_SIZE_L: "28px",
		FONT_SIZE_XL: "32px",
		FONT_SIZE_XXL: "40px",
	},

	fontWeight: {
		FONT_WEIGHT_LIGHT: "300",
		FONT_WEIGHT_REGULAR: "400",
		FONT_WEIGHT_MEDIUM: "500",
		FONT_WEIGHT_BOLD: "600",
		FONT_WEIGHT_EXTRA_BOLD: "700",
	},

	fontFamily: {
		INTER: "Inter",
	},

	spacing: {
		SPACING_ZERO: "0rem",
		SPACING_XS: "0.1rem",
		SPACING_S: "0.25rem",
		SPACING_M: "0.5rem",
		SPACING_XMS: "0.75rem",
		SPACING_XML: "1rem",
		SPACING_XM: "1.5rem",
		SPACING_L: "2rem",
		SPACING_XL: "2.5rem",
		SPACING_XXL: "3rem",
	},

	flexDirectionTypes: {
		ROW: "row",
		COULUMN: "column",
	},
};

export type AppTheme = typeof theme;

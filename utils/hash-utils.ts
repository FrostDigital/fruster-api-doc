import ToolStore from "../stores/ToolStore";
import UIStore from "../stores/UIStore";

export function reactToHashChange(toolStore: ToolStore, uiStore: UIStore) {
	toolStore.currentHash = window.location.hash;

	const decodedURI = decodeURI(window.location.hash);

	if (!decodedURI.includes("#"))
		return;

	let decodedURIWithoutHash = decodedURI.replace("#", "");

	const modalHashQuery = "?modal=";

	if (decodedURI.includes(modalHashQuery)) {
		const parts = decodedURIWithoutHash.split(modalHashQuery);
		const modalParts = parts[1].split("&tab");
		const openSchema = modalParts[0];
		const tabIndex = modalParts[1] ? modalParts[1].replace("=", "") : "0";

		decodedURIWithoutHash = parts[0];

		uiStore.setOpenSchemaForEndpoint(decodedURIWithoutHash, openSchema);
		uiStore.currentModalTabIndex = Number.parseInt(tabIndex);
	} else
		uiStore.currentModalTabIndex = 0;

	uiStore.open(decodedURIWithoutHash);

	if (document.getElementById(decodedURIWithoutHash))
		document.getElementById(decodedURIWithoutHash).scrollIntoView();
}

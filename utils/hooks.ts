import { useEffect, useState } from "react";

export function useDebounce(value: any, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}


export function useScript(src) {
	const [status, setStatus] = useState(src ? "loading" : "idle");

	useEffect(() => {
		if (!src) {
			setStatus("idle");
			return;
		}

		let script = document.querySelector(`script[src="${src}"]`);

		if (!script) {
			script = document.createElement("script");
			// @ts-ignore
			script.src = src;
			// @ts-ignore
			script.async = true;
			script.setAttribute("data-status", "loading");

			document.body.appendChild(script);

			const setAttributeFromEvent = (event) => {
				script.setAttribute("data-status", event.type === "load" ? "ready" : "error");
			};

			script.addEventListener("load", setAttributeFromEvent);
			script.addEventListener("error", setAttributeFromEvent);

		} else
			setStatus(script.getAttribute("data-status"));

		const setStateFromEvent = (event) => setStatus(event.type === "load" ? "ready" : "error");

		script.addEventListener("load", setStateFromEvent);
		script.addEventListener("error", setStateFromEvent);

		return () => {
			if (script) {
				script.removeEventListener("load", setStateFromEvent);
				script.removeEventListener("error", setStateFromEvent);
			}
		};
	},
		[src] // Only re-run effect if script src changes
	);

	return status;
}

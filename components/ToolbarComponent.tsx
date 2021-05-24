import $ from "jquery";
import { observer } from "mobx-react";
import React, { createRef, useEffect, useState } from "react";
import styled from "styled-components";
import { ICON } from "../constants";
import { useStore } from "../stores/StoreContext";
import { FILTER_TYPE } from "../stores/ToolStore";
import ClearFix from "./ClearFix";
import Icon, { ICON_COLOR } from "./Icon";
import ScrollToTopComponent from "./ScrollToTopComponent";

const ToolbarComponent = () => {
	const { toolStore, filterStore } = useStore();
	const { nightmode } = toolStore;
	const filterInput = createRef<HTMLInputElement>();
	const filterBySelectRef = createRef<HTMLSelectElement>();
	const [menuOpen, setMenuOpen] = useState(false);
	const [filterText, setFilterText] = useState(toolStore.filter);
	const [filterDebounceTimeout, setFilterDebounceTimeout] = useState(undefined);

	// To speed up ui responsiveness
	useEffect(() => {
		setFilterText(toolStore.filter);
	}, [toolStore.filter]);

	useEffect(() => {
		window.addEventListener("keydown", handler, false);

		let inputInProgress = false;
		let coolDown = 200;

		function handler(e) {
			if (
				document.activeElement.id !== "filter" // make sure we are not currently typing in the filter box
				&& !e.ctrlKey // make sure ctrl is not held down (To not interfere with browser shortcuts)
				&& !e.metaKey // make sure cmd is not held down (To not interfere with browser shortcuts)
			) {
				if (!inputInProgress) {
					inputInProgress = true;

					switch (e.key) {
						case "f":
							// Focus filter input
							setTimeout(() => {
								if (filterInput && filterInput.current) {
									const backupValue = filterInput.current.value;
									filterInput.current.value = "";
									filterInput.current.focus();
									filterInput.current.value = backupValue;
								}
							}, 10);

							break;
						case "g":
							if (filterBySelectRef.current) {
								if (filterBySelectRef.current.selectedIndex < 3)
									filterBySelectRef.current.selectedIndex++;
								else
									filterBySelectRef.current.selectedIndex = 0;

								toolStore.filterBy = filterBySelectRef.current.value as FILTER_TYPE;
							}
							break;
						case "r":
							resetFilter();
							break;
						case "t":
							// scroll to top
							scrollToTop();
							break;
						case "n":
							coolDown = 1000;
							// nightmode
							toggleNightmode();
							break;
					}
					setTimeout(() => {
						inputInProgress = false;
					}, coolDown);
				}
			}
		}

		return function cleanup() {
			window.removeEventListener("keydown", handler);
		}
	});

	const resetFilter = () => {
		if (filterText !== "") {
			toolStore.resetFilter();
			filterStore.resetFilteredEndpoints();
			setFilterText("");
			history.replaceState(undefined, undefined, `#`);
			scrollToTop();
		}
	};

	const scrollToTop = () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		history.replaceState(undefined, undefined, `#`);
	};

	const toggleNightmode = async () => {
		await fetch("./nightmode", { method: nightmode ? "DELETE" : "POST" });

		document.getElementsByTagName("body")[0].classList.remove("ready");
		// setTimeout(() => document.getElementsByTagName("body")[0].classList.add("ready"), 100);

		if (!nightmode)
			document.getElementsByTagName("body")[0].classList.add("nightmode");
		else {
			document.getElementsByTagName("body")[0].classList.remove("nightmode");
			document.getElementsByTagName("body")[0].style.backgroundColor = "";
		}

		toolStore.nightmode = !nightmode;
	}

	const handleNewFilterValue = (e) => {
		e.persist();

		// scrollToTop();

		setFilterText(e.target.value);
		// toolStore.filter = e.target.value;

		clearTimeout(filterDebounceTimeout);

		let timeout = 200;

		// if (toolStore.filterBy === FILTER_TYPE.DOCS)
		// 	timeout = 200;

		setFilterDebounceTimeout(setTimeout(() => {
			toolStore.filter = e.target.value;

			if (e.target.value === "") {
				toolStore.resetFilter();
				filterStore.resetFilteredEndpoints();
			}
		}, timeout));
	}

	const renderFiltering = () => {
		return (
			<div
				className="filter-container"
				style={{
					borderRight: "1px solid #ffffff36"
				}}
			>
				<div className="form-group">
					<input
						title="Filter (F)"
						type="text"
						className="form-control"
						id="filter"
						ref={filterInput}
						value={filterText}
						placeholder="Filter"
						onPaste={(e) => handleNewFilterValue(e)}
						onChange={(e) => handleNewFilterValue(e)}
					/>
				</div>

				<div
					className="form-group"
					title="Filter by [G to cycle]"
				>
					<label htmlFor="filter-by">by&nbsp;</label>
					<select
						ref={filterBySelectRef}
						value={toolStore.filterBy}
						className="form-control"
						id="filter-by"
						onChange={(e) => toolStore.filterBy = e.target.value as FILTER_TYPE} >
						<option value={FILTER_TYPE.SUBJECT}>endpoint subject/url</option>
						<option value={FILTER_TYPE.PERMISSIONS}>permissions</option>
						<option value={FILTER_TYPE.DOCS}>docs</option>
						<option value={FILTER_TYPE.SERVICE}>service/deis app name</option>
					</select>
				</div>
				&nbsp;
				<button
					className="nightmode-button btn btn-xs btn-default icon-btn"
					title="Reset filter (R)"
					style={{
						marginTop: -2
					}}
					onClick={resetFilter}
				>
					<Icon type={ICON.RESET} size={16} color={ICON_COLOR.TOOL_MENU} />
				</button>&nbsp;

			</div>
		);
	}

	const resetCache = async () => {
		if (confirm(`Usecases for resetting cache:
	- Old endpoints are still showing up.
	- Too many errors are showing up (Typically after a redeploy of fruster-api-doc).
	- No endpoints are showing up even after several normal refreshes.

*This should not be used too much as it increases loading times severely, especially right after cache is reset*

After cache is reset, it is normal for nothing to appear until a couple of refreshes are done.

Are you sure you want to reset the cache?
        `)) {
			await $.post("/reset-cache");
			location.reload();
		}
	}

	return (
		<div className="toolbar">

			<StyledContainer className="container">

				{/* Buttons to the left */}
				<div
					style={{
						borderRight: "1px solid #ffffff36"
					}}
				>
					<ScrollToTopComponent />

					<button
						className="nightmode-button btn btn-xs btn-default icon-btn"
						title="Toggle nightmode (N)"
						onClick={() => toggleNightmode()}
					>
						{
							nightmode
								? <Icon hidden={!nightmode} type={ICON.SUN} size={16} color={ICON_COLOR.TOOL_MENU} />
								: <Icon hidden={nightmode} type={ICON.MOON} size={16} color={ICON_COLOR.TOOL_MENU} />
						}
					</button>
					{/*
					<Link href="/" scroll={false}>
						<button
							className="btn btn-xs btn-default icon-btn"
							title="Get latest state without refresh"
							style={{
								background: "none",
								color: "white",
								height: "22px",
								float: "left"
							}}
						>
							<Icon type={ICON.REFRESH}/>
						</button>
					</Link> */}
				</div>

				{renderFiltering()}

				{/* Buttons to the right */}

				<button
					className="nightmode-button btn btn-xs btn-default icon-btn"
					onClick={() => setMenuOpen(!menuOpen)}>
					{menuOpen ?
						<Icon
							type={ICON.MENU_RIGHT}
							title="more tools..."
							className="toggle-fold-btn"
							margin="1px 0 0 0"
							color={ICON_COLOR.TOOL_MENU_OPEN}
						/>
						:
						<Icon
							type={ICON.MENU_LEFT}
							title="more tools..."
							className="toggle-fold-btn"
							margin="1px 0 0 0"
							color={ICON_COLOR.TOOL_MENU}
						/>

						// padding={"16px 0 0 0"} margin={"0 5px 0 0"} color={ICON_COLOR.MENU}
					}
				</button>
				{
					menuOpen &&
					<div className="float-right">
						<button
							className="btn btn-xs btn-danger"
							title={`Usecases for resetting cache:
	- Old endpoints are still showing up.
	- Too many errors are showing up (Typically after a redeploy of fruster-api-doc).
	- No endpoints are showing up even after several normal refreshes.

After cache is reset, it is normal for nothing to appear until a couple of refreshes are done.

*This should not be used too much as it increases loading times severely, especially right after cache is reset*`}
							onClick={() => resetCache()}>
							Reset cache
						</button>
					</div>
				}

			</StyledContainer>

			<ClearFix />
		</div>
	);
};

export default observer(ToolbarComponent);

const StyledContainer = styled.div`
	max-width: 1170px !important;
	width: 100%;
	display: flex !important;
	justify-content: center !important;
	/* justify-content: space-between; */
	padding: 0;
	margin: 0;

`;

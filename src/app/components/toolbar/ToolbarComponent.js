import $ from "jquery";
import React from "react";
import ScrollToTopComponent from "../scroll-to-top/ScrollToTopComponent";


export default class ToolbarComponent extends React.Component {

    constructor(props) {
        super(props);

        this.allEndpointsOpen = false;
    }

    render() {
        return (
            <div className="toolbar">

                <div className="container">

                    {/* Buttons to the left */}
                    <ScrollToTopComponent />

                    <button
                        className="btn btn-xs"
                        onClick={() => this.expandAll()}>
                        {this.allEndpointsOpen ? "Close" : "Expand"} all endpoints
                    </button>

                    {/* Buttons to the right */}
                    <span className="float-right">
                        <button
                            className="btn btn-danger btn-xs"
                            onClick={() => this.resetCache()}>
                            Reset cache
                    </button>
                    </span>

                </div>

                <div className="clearfix"></div>
            </div>
        );
    }

    async resetCache() {
        if (confirm(`Usecases for resetting cache:
  - Old endpoints are still showing up.
  - Too many errors are showing up (Typically after a redeploy of fruster-api-doc).
  - No endpoints are showing up even after several normal refreshes.

*This should not be used too much as it increases loading times severely, specially right after cache is reset* 

Are you sure you want to reset the cache?
        `)) {
            await $.post("/reset-cache");
            location.reload();
        }
    }

    expandAll() {
        const foldButtons = document.querySelectorAll(".endpoint-fold-btn");

        foldButtons.forEach((button, i) => {
            if (!this.allEndpointsOpen) {
                if (!Array.from(button.classList).includes("open"))
                    setTimeout(() => button.click()); /** Makes the process incremental instead of it waiting for everything to finish (Non blocking in other words)*/
            } else
                if (Array.from(button.classList).includes("open"))
                    setTimeout(() => button.click()); /** Makes the process incremental instead of it waiting for everything to finish (Non blocking in other words)*/
        });

        this.allEndpointsOpen = !this.allEndpointsOpen;
        this.forceUpdate();
    }

    shouldComponentUpdate() {
        return false;
    }

}
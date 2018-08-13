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

*This should not be used too much as it increases loading times severely, especially right after cache is reset* 

Are you sure you want to reset the cache?
        `)) {
            await $.post("/reset-cache");
            location.reload();
        }
    }

    shouldComponentUpdate() {
        return false;
    }

}
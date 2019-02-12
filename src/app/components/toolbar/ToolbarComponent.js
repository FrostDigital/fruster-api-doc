import $ from "jquery";
import React from "react";
import ScrollToTopComponent from "../scroll-to-top/ScrollToTopComponent";
import { ApiDocContext } from "../../Context";
import { throws } from "assert";

export default class ToolbarComponent extends React.Component {

    constructor(props) {
        super(props);

        this.allEndpointsOpen = false;
    }

    render() {
        return (
            <ApiDocContext.Consumer>
                {context => (
                    <div className="toolbar">

                        <div className="container">

                            {/* Buttons to the left */}
                            <ScrollToTopComponent />

                            {this.renderFiltering(context)}

                            {/* Buttons to the right */}
                            <div className="float-right">
                                <button
                                    className="btn btn-danger btn-xs"
                                    onClick={() => this.resetCache()}>
                                    Reset cache
                            </button>
                            </div>

                        </div>

                        <div className="clearfix"></div>
                    </div>
                )}
            </ApiDocContext.Consumer>
        );
    }

    renderFiltering(context) {
        return (
            <div className="filter-container">
                <div className="form-group">
                    <label htmlFor="filter">Filter:</label>
                    <input type="text" className="form-control" id="filter"
                        onChange={(e) => {
                            e.persist();

                            if (this.timeout)
                                clearTimeout(this.timeout);

                            this.timeout = setTimeout(() => {
                                console.log("FILTERING!");
                                context.filter(e);
                            }, 100);
                        }} />
                </div>

                <div className="form-group">
                    <label htmlFor="filter-by">Filter by:</label>
                    <select
                        value={context.filterBy}
                        className="form-control"
                        id="filter-by"
                        onChange={(e) => context.changeFilterType(e)} >
                        <option value="subject">endpoint subject/url</option>
                        <option value="persmissions">permissions</option>
                        <option value="docs">docs</option>
                    </select>
                </div>

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
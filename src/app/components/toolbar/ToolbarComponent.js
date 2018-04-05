import React from "react";
import $ from "jquery";

export default class ToolbarComponent extends React.Component {

    render() {
        return (
            <div className="toolbar">

                <button
                    className="btn btn-danger btn-xs"
                    id="reset-cache"
                    onClick={() => this.resetCache()}>
                    Reset cache
                </button>

                <div className="clearfix"></div>
            </div>
        );
    }

    async resetCache() {
        if (confirm("This should only be used when old endpoints still show up in the list. \nAre you sure you want to reset the cache?")) {
            await $.post("/reset-cache");
            location.reload();
        }
    }

}
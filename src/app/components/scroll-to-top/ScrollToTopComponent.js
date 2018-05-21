import React from "react";

export default class ScrollToTopComponent extends React.Component {

    render() {
        return (
            <span>
                <center>
                    <button
                        onClick={e => this.scrollToTop()}
                        type="button"
                        className="toc btn btn-default btn-sm">
                        <span className="glyphicon glyphicon-arrow-up"></span>
                    </button>
                </center>
            </span>
        );
    }

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        location.hash = "";
    }

}
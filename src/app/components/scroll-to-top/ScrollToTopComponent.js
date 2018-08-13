import React from "react";

export default class ScrollToTopComponent extends React.Component {

    render() {
        return (
            <button
                onClick={e => this.scrollToTop()}
                type="button"
                className="toc btn btn-xs btn-default">
                <span className="glyphicon glyphicon-arrow-up"></span> Scroll to top
            </button>
        );
    }

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        location.hash = "";
    }

}
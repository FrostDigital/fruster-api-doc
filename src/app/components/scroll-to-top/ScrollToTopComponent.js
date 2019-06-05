import React from "react";

export default class ScrollToTopComponent extends React.Component {

    render() {
        return (
            <button
                onClick={e => this.scrollToTop()}
                type="button"
                title="Scroll to top (T)"
                className="btn btn-xs btn-default"
                style={{ 
                    // Due to some extreme bug where the whole button would disappear and then crash if inspected if using css class for this, the css has been moved here.
                    background: "none",
                    color: "white",
                    height: "22px",
                    float: "left"
                }}>
                Scroll to top
            </button>
        );
    }

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        location.hash = "";
    }

}
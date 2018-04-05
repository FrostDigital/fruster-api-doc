import React from "react";

export default class ScrollToTopComponent extends React.Component {

    componentDidMount() {
        this.handleScroll();
        window.addEventListener("scroll", () => this.handleScroll());
    }

    render() {
        return (
            <span hidden={this.isHidden}>
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

    handleScroll() {
        if (document.documentElement.scrollTop === 0)
            this.isHidden = true;
        else
            this.isHidden = false;

        this.forceUpdate();
    }

    scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        location.hash = "";
    }

}
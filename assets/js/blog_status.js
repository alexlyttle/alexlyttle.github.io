var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * See https://developer.github.com/v3/repos/branches/#get-branch
 *
 * Example Github api request:
 * https://api.github.com/repos/ta-dachi/eatsleepcode.tech/branches/master
 */
var LatestCommitComponent = function (_React$Component) {
    _inherits(LatestCommitComponent, _React$Component);

    function LatestCommitComponent(props) {
        _classCallCheck(this, LatestCommitComponent);

        var _this = _possibleConstructorReturn(this, (LatestCommitComponent.__proto__ || Object.getPrototypeOf(LatestCommitComponent)).call(this, props));

        _this.state = {
            status: ""
        };
        return _this;
    }

    _createClass(LatestCommitComponent, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            // The 'sha' is the hash key for the GitHub Gist
            fetch("https://api.github.com/gists/" + this.props.sha).then(function (response) {
                response.json().then(function (json) {
                    console.log(json);
                    var options = { day: 'numeric', month: 'long', year: 'numeric' }; // Options for date format
                    var created = new Date(json.created_at).toLocaleString('default', options);
                    var updated = new Date(json.updated_at).toLocaleString('default', options);
                    var status = "Created: " + created + " \u2022 " + "Updated: " + updated;
                    // If created and updated are the same then only show created date
                    if (created == updated) {
                        status = created;
                    }
                    _this2.setState({
                        status: status
                    });
                });
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "render",
        value: function render() {
            return this.state.status;
        }
    }]);

    return LatestCommitComponent;
}(React.Component);

ReactDOM.render(React.createElement(LatestCommitComponent, { sha: "92b6862286990967cfa9deb5e91df9a3" }), document.getElementById("dream-analysis-date"));
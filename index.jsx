/**
 * See https://developer.github.com/v3/repos/branches/#get-branch
 *
 * Example Github api request:
 * https://api.github.com/repos/ta-dachi/eatsleepcode.tech/branches/master
 */
class LatestCommitComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            created: "",
            updated: ""
        };
    }
  
    componentDidMount() {
        // Replace this with your own Github gist
        // https://api.github.com/gists/:sha
        // The 'sha' is the hash key for the GitHub Gist
        fetch(
            "https://api.github.com/gists/" + this.props.sha
        )
            .then(response => {
                response.json().then(json => {
                    console.log(json);
                    let options = { day: 'numeric', month: 'long', year: 'numeric' };  // Options for date format
                    var created = new Date(json.created_at).toLocaleString('default', options);
                    var updated = new Date(json.updated_at).toLocaleString('default', options);
                    this.setState({
                        created: created,
                        updated: updated
                    });
                });
            })
            .catch(error => {
                console.log(error);
            });
    }
  
    render() {
        // If created and updated dates are the same, only display the created date
        if (this.state.created == this.state.updated) {
            return (
                <div>
                    {this.state.created}
                </div>
            );
        } else {
            return (
                <div>
                    Created: {this.state.created} &nbsp;&bull;&nbsp; Updated: {this.state.updated}
                </div>
            );
        }
    }
}

ReactDOM.render(<LatestCommitComponent sha="92b6862286990967cfa9deb5e91df9a3" />, document.getElementById("dream-analysis-date"));

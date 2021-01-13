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
            status: "",
        };
    }
  
    componentDidMount() {
        // The 'sha' is the hash key for the GitHub Gist
        fetch(
            "https://api.github.com/gists/" + this.props.sha
        ).then(response => {
            response.json().then(json => {
                console.log(json);
                let options = { day: 'numeric', month: 'long', year: 'numeric' };  // Options for date format
                var created = new Date(json.created_at).toLocaleString('default', options);
                var updated = new Date(json.updated_at).toLocaleString('default', options);
                var status = "Created: " + created + " \u2022 " + "Updated: " + updated
                // If created and updated are the same then only show created date
                if (created == updated) {
                    status = created
                }
                this.setState({
                    status: status
                });
            });
        }).catch(error => {
            console.log(error);
        });
    }
  
    render() {
        return (
            this.state.status
        )
    }
}

ReactDOM.render(<LatestCommitComponent sha="92b6862286990967cfa9deb5e91df9a3" />, document.getElementById("dream-analysis-date"));


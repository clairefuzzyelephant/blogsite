import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "../../utilities.css";
import "./Homepage.css";

import { get, post } from "../../utilities";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputTitle: '',
      inputText: '',
      postList: null,
    };
  }

  componentDidMount() {
    this.loadPosts();
  }

  loadPosts = () => {
    if (this.state.postList == null) {
      get("/api/retrievePosts", {username: this.props.userId}).then((posts) => {
        posts.reverse();
        this.setState({
          postList: posts
        });
      });
    }
  }

  handleTitleChange = (event) => {
    const value = event.target.value;
    this.setState({
      inputTitle: value,
    });
    if (event.keyCode === 13) { //pressing enter key
      event.preventDefault();
    }
  }

  handleBodyTextChange = (event) => {
    const value = event.target.value;
    this.setState({
      inputText: value,
    });
    if (event.keyCode === 13) { //pressing enter key
      event.preventDefault();
    }
  }

  submitPost = (event) => {
    event.preventDefault();
    if (this.state.inputText.length !== 0) {
      const body = {username: this.props.userId, title: this.state.inputTitle, text: this.state.inputText};
      post("/api/submitPost", body).then((post) => {
        var updatedPostList = this.state.postList.slice();
        updatedPostList.splice(0, 0, post);
        this.setState({
          postList: updatedPostList,
          inputTitle: '',
          inputText: '',
        })
      });
    }
  }

  render() {
    return (
      <div className="background">
      <div className="title">Blog</div>
        {this.props.userId ? (
          <>
          {this.loadPosts()}
          <div className="googleButton">
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={this.props.handleLogout}
              onFailure={(err) => console.log(err)}
            />
          </div>
        <div className="newsFeed">
        <div className="postingContainer">
          <div>
            <textarea
              name="title_text"
              cols="30"
              rows="1"
              placeholder={"Title"}
              value={this.state.inputTitle}
              onChange={this.handleTitleChange}
            ></textarea>
          </div>
          <textarea
            name="paragraph_text"
            cols="50"
            rows="10"
            placeholder={"Start writing here"}
            value={this.state.inputText}
            onChange={this.handleBodyTextChange}
          ></textarea>
          <div></div>
          <button
            onClick={this.submitPost}>
            Post
          </button>
          </div>
          {this.state.postList != null ? this.state.postList.map((post) => 
            <div className='postContainer'>
              <div className='postTitle'>
                {post.title}
              </div>
              <div className='postDate'>
                Posted on {new Date(post.timestamp).toLocaleString()}
              </div>
              <div className='postBody'>
                {post.text}
              </div>
            </div>) : null}
          </div>
          </>
        ) : (
          <div className="googleButton">
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Login"
              onSuccess={this.props.handleLogin}
              onFailure={(err) => console.log(err)}
            />
          </div>
        )}
      </div>
    );
  }
}

export default Homepage;

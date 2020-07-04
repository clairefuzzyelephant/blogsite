import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

import "../utilities.css";
import "./App.css";

const GOOGLE_CLIENT_ID = "294124002149-m4d05cdt2ponre2ccdm3cf78773dv9q5.apps.googleusercontent.com";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
      inputTitle: '',
      inputText: '',
      postList: undefined,
      editTitle: '',
      editText: '',
      editingPost: null,
    };
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user.googleid) {
        this.setState({ userId: user.googleid });
        this.loadPosts(user.googleid);
      }
    });
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user.googleid });
      this.loadPosts(user.googleid);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

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

  handleEditTitleChange = (event) => {
    const value = event.target.value;
    this.setState({
      editTitle: value,
    });
    if (event.keyCode === 13) { //pressing enter key
      event.preventDefault();
    }
  }

  handleEditTextChange = (event) => {
    const value = event.target.value;
    this.setState({
      editText: value,
    });
    if (event.keyCode === 13) { //pressing enter key
      event.preventDefault();
    }
  }

  saveEditedPost = (currentPost) => {
    if (this.state.editText.length !== 0) {
      const body = {id: currentPost._id, user: this.state.userId, title: this.state.editTitle, text: this.state.editText, timestamp: currentPost.timestamp};
      post("/api/updatePost", body).then((post) => {
        this.loadPosts(this.state.userId);
        this.setState({
          editTitle: '',
          editText: '',
          editingPost: null,
        })
      })
    }
  }

  cancelEditing = (event) => {
    this.setState({
      editingPost: null,
      editTitle: '',
      editText: '',
    })
  }

  loadPosts = (googleid) => {
    get("/api/retrievePosts", {user: googleid}).then((posts) => {
      posts.reverse();
      this.setState({
        postList: posts
      });
    });
  }

  submitPost = (event) => {
    event.preventDefault();
    if (this.state.inputText.length !== 0) {
      const body = {user: this.state.userId, title: this.state.inputTitle, text: this.state.inputText};
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

  editPost = (id) => {
    if (this.state.editingPost != null && this.state.editingPost._id != id) {
      confirmAlert({
        title: 'You are currently editing a post!',
        message: 'Please save the current post before editing another post, or discard your changes by clicking Cancel.',
        buttons: [
          {
            label: 'OK',
          },
        ]
      })
    }
    else {
      const currentPost = this.state.postList.find(item => item._id == id);
      this.setState({
        editingPost: currentPost,
        editTitle: currentPost.title,
        editText: currentPost.text,
      });
    }
  }

  deletePost = (id) => {
    confirmAlert({
      title: 'Confirm post deletion',
      message: 'You are deleting a post. This cannot be undone!',
      buttons: [
        {
          label: 'Cancel',
        },
        {
          label: 'Delete post',
          onClick: () =>  {
            post("api/deletePost", {id: id}).then((post) => {
              const { postList } = this.state;
              const reloadPosts = postList.filter(item => item._id !== id);
              this.setState({ postList: reloadPosts });
            });
          }
        }
      ]
    })
  }

  render() {
    return (
      <div className="background">
        <div className="title">Blog</div>
        {this.state.userId ? 
          <div className="googleButton">
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={this.handleLogout}
              onFailure={(err) => console.log(err)}
            />
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
                <div className='editButton'>
                  <button onClick={() => this.editPost(post._id)}>Edit</button>
                </div>
                <div className='deleteButton'>
                  <button onClick={() => this.deletePost(post._id)}>Delete</button>
                </div>
                <div className='postTitle'>
                  {this.state.editingPost != post 
                  ? post.title 
                  : <textarea
                      name="title_text"
                      cols="30"
                      rows="1"
                      value={this.state.editTitle}
                      onChange={this.handleEditTitleChange}
                    ></textarea>
                  }
                </div>
                <div className='postDate'>
                  Posted on {new Date(post.timestamp).toLocaleString()}{post.updated != null && post.timestamp != post.updated 
                    ? <>, updated {new Date(post.updated).toLocaleString()}</>
                    : null
                  }
                </div>
                <div className='postBody'>
                  {this.state.editingPost != post 
                  ? post.text
                  : <textarea
                      name="paragraph_text"
                      cols="50"
                      rows="5"
                      value={this.state.editText}
                      onChange={this.handleEditTextChange}
                    ></textarea>
                }
                </div>
                <div>
                  {this.state.editingPost == post
                  ? <><button onClick={() => this.saveEditedPost(post)}>Save</button>
                  <button onClick={() => this.cancelEditing()}>Cancel</button></>
                  : null
                  }
                  </div>
              </div>) : null}
            </div>
          </div>
        : 
        <div className="googleButton">
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={this.handleLogin}
            onFailure={(err) => console.log(err)}
          />
        </div>}

        
      </div>
    );
  }
}

export default App;

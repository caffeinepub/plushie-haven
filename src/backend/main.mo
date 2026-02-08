import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type Post = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
  };

  let posts = Map.empty<Nat, Post>();
  var nextPostId = 0;

  public shared ({ caller }) func createPost(authorName : ?Text, title : Text, body : Text) : async Nat {
    if (title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (body.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let post : Post = {
      id = nextPostId;
      author = caller;
      authorName;
      title;
      body;
      createdAt = Time.now();
    };

    posts.add(nextPostId, post);
    let postId = nextPostId;
    nextPostId += 1;
    postId;
  };

  public query ({ caller }) func listPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(id : Nat) : async Post {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };
};

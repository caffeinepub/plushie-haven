import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldModeratedContent = {
    id : Nat;
    author : Principal;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
    submittedAt : Int;
    moderationOutcome : {
      #allow;
      #block;
      #manualReview;
    };
  };

  type OldPost = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Int;
    video : ?Storage.ExternalBlob;
  };

  type OldComment = {
    postId : Nat;
    author : Principal;
    authorName : ?Text;
    content : Text;
    createdAt : Int;
  };

  type OldActor = {
    moderationQueue : Map.Map<Nat, OldModeratedContent>;
    posts : Map.Map<Nat, OldPost>;
    comments : Map.Map<Nat, List.List<OldComment>>;
  };

  type NewModeratedContent = {
    id : Nat;
    author : Principal;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
    image : ?Storage.ExternalBlob;
    submittedAt : Int;
    moderationOutcome : {
      #allow;
      #block;
      #manualReview;
    };
  };

  type NewPost = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Int;
    video : ?Storage.ExternalBlob;
    image : ?Storage.ExternalBlob;
  };

  type NewComment = {
    postId : Nat;
    author : Principal;
    authorName : ?Text;
    content : Text;
    createdAt : Int;
  };

  type NewActor = {
    moderationQueue : Map.Map<Nat, NewModeratedContent>;
    posts : Map.Map<Nat, NewPost>;
    comments : Map.Map<Nat, List.List<NewComment>>;
  };

  public func run(old : OldActor) : NewActor {
    let newModerationQueue = old.moderationQueue.map<Nat, OldModeratedContent, NewModeratedContent>(
      func(_id, oldContent) {
        {
          oldContent with
          image = null;
        };
      }
    );
    let newPosts = old.posts.map<Nat, OldPost, NewPost>(
      func(_id, oldPost) {
        {
          oldPost with
          image = null;
        };
      }
    );
    { old with moderationQueue = newModerationQueue; posts = newPosts };
  };
};

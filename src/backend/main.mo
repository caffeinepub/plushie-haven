import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  include MixinStorage();

  // Full User Profile
  public type Link = {
    url : Text;
    displayName : Text;
  };

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    links : [Link];
    plushieImages : [Storage.ExternalBlob];
    publicDirectory : Bool;
  };

  // Partial profile for editing
  public type UserProfileEdit = {
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    links : [Link];
    plushieImages : [Storage.ExternalBlob];
    publicDirectory : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Profile CRUD methods

  public shared ({ caller }) func saveCallerUserProfile(profileEdit : UserProfileEdit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let newProfile : UserProfile = {
      profileEdit with
      links = profileEdit.links;
      plushieImages = profileEdit.plushieImages;
    };

    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    let profile = userProfiles.get(user);
    switch (profile) {
      case (null) { null };
      case (?p) {
        if (p.publicDirectory or caller == user or AccessControl.isAdmin(accessControlState, caller)) {
          ?p;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listDirectoryProfiles() : async [UserProfile] {
    userProfiles.values().toArray().filter(func(profile) { profile.publicDirectory });
  };

  // Legacy (unchanged) for backward compatibility
  type ImageAttachment = {
    bytes : [Nat8];
    contentType : Text;
  };

  type LegacyPost = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    image : ?ImageAttachment;
  };

  type Event = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    description : Text;
    location : Text;
    startTime : Time.Time;
    endTime : Time.Time;
    createdAt : Time.Time;
  };

  let posts = Map.empty<Nat, LegacyPost>();
  var nextPostId = 0;

  let events = Map.empty<Nat, Event>();
  var nextEventId = 0;

  public shared ({ caller }) func createPost(authorName : ?Text, title : Text, body : Text, imageBytes : ?[Nat8], imageContentType : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    if (title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (body.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let image = switch (imageBytes, imageContentType) {
      case (?bytes, ?contentType) {
        ?{
          bytes;
          contentType;
        };
      };
      case (_) { null };
    };

    let post : LegacyPost = {
      id = nextPostId;
      author = caller;
      authorName;
      title;
      body;
      createdAt = Time.now();
      image;
    };

    posts.add(nextPostId, post);
    let postId = nextPostId;
    nextPostId += 1;
    postId;
  };

  public query ({ caller }) func listPosts() : async [LegacyPost] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(id : Nat) : async LegacyPost {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func deletePost(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users and admins can delete posts");
    };

    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (post.author != caller) {
        Runtime.trap("Unauthorized: Only the author or an admin can delete this post");
      };
    };

    posts.remove(id);
  };

  public shared ({ caller }) func editPost(id : Nat, newTitle : Text, newBody : Text, newAuthorName : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can edit posts");
    };

    if (newTitle.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (newBody.trim(#char ' ').size() == 0) { Runtime.trap("Body cannot be empty") };

    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    let updatedPost : LegacyPost = {
      post with
      title = newTitle;
      body = newBody;
      authorName = newAuthorName;
    };

    posts.add(id, updatedPost);
  };

  // Events
  public shared ({ caller }) func createEvent(authorName : ?Text, title : Text, description : Text, location : Text, startTime : Time.Time, endTime : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };

    if (title.trim(#char ' ').size() == 0) { Runtime.trap("Title cannot be empty") };
    if (description.trim(#char ' ').size() == 0) { Runtime.trap("Description cannot be empty") };
    if (location.trim(#char ' ').size() == 0) { Runtime.trap("Location cannot be empty") };
    if (startTime >= endTime) { Runtime.trap("Start time must be before end time") };

    let event : Event = {
      id = nextEventId;
      author = caller;
      authorName;
      title;
      description;
      location;
      startTime;
      endTime;
      createdAt = Time.now();
    };

    events.add(nextEventId, event);
    let eventId = nextEventId;
    nextEventId += 1;
    eventId;
  };

  public query ({ caller }) func listEvents() : async [Event] {
    events.values().toArray();
  };

  public query ({ caller }) func getEvent(id : Nat) : async Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };
};

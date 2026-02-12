import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type SupporterRequest = {
    submittedAt : Time.Time;
    displayName : Text;
    message : Text;
    numberOfCoffees : ?Nat;
    validUntil : ?Time.Time;
  };

  type SupporterProfile = {
    addedAt : Time.Time;
    displayName : Text;
    validUntil : ?Time.Time;
  };

  type Link = {
    url : Text;
    displayName : Text;
  };

  type UserProfile = {
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    links : [Link];
    plushieImages : [Storage.ExternalBlob];
    publicDirectory : Bool;
  };

  type Post = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    video : ?Storage.ExternalBlob;
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

  type FollowInfo = {
    followers : List.List<Principal>;
    following : List.List<Principal>;
  };

  type Comment = {
    postId : Nat;
    author : Principal;
    authorName : ?Text;
    content : Text;
    createdAt : Time.Time;
  };

  type PostWithCounts = {
    post : Post;
    likeCount : Nat;
    commentCount : Nat;
  };

  type PollOption = {
    optionId : Nat;
    text : Text;
  };

  type Poll = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
  };

  type PollWithResults = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
    results : [(Nat, Nat)];
  };

  type ModerationOutcome = {
    #allow;
    #block;
    #manualReview;
  };

  type ModeratedContent = {
    id : Nat;
    author : Principal;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
    submittedAt : Time.Time;
    moderationOutcome : ModerationOutcome;
  };

  type OldActor = {
    supporterRequests : Map.Map<Principal, SupporterRequest>;
    supporters : Map.Map<Principal, SupporterProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    posts : Map.Map<Nat, Post>;
    nextPostId : Nat;
    events : Map.Map<Nat, Event>;
    nextEventId : Nat;
    followData : Map.Map<Principal, FollowInfo>;
    postLikes : Map.Map<Nat, List.List<Principal>>;
    profileLikes : Map.Map<Principal, List.List<Principal>>;
    comments : Map.Map<Nat, List.List<Comment>>;
    polls : Map.Map<Nat, Poll>;
  };

  type NewActor = {
    supporterRequests : Map.Map<Principal, SupporterRequest>;
    supporters : Map.Map<Principal, SupporterProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    posts : Map.Map<Nat, Post>;
    nextPostId : Nat;
    events : Map.Map<Nat, Event>;
    nextEventId : Nat;
    followData : Map.Map<Principal, FollowInfo>;
    postLikes : Map.Map<Nat, List.List<Principal>>;
    profileLikes : Map.Map<Principal, List.List<Principal>>;
    comments : Map.Map<Nat, List.List<Comment>>;
    polls : Map.Map<Nat, Poll>;
    moderationQueue : Map.Map<Nat, ModeratedContent>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      moderationQueue = Map.empty<Nat, ModeratedContent>();
    };
  };
};

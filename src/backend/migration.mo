import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";

module {
  public type SupporterRequest = {
    submittedAt : Time.Time;
    displayName : Text;
    message : Text;
    numberOfCoffees : ?Nat;
    validUntil : ?Time.Time;
  };

  public type SupporterProfile = {
    addedAt : Time.Time;
    displayName : Text;
    validUntil : ?Time.Time;
  };

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

  public type ModerationOutcome = {
    #allow;
    #block;
    #manualReview;
  };

  public type ModeratedContent = {
    id : Nat;
    author : Principal;
    title : Text;
    body : Text;
    video : ?Storage.ExternalBlob;
    submittedAt : Time.Time;
    moderationOutcome : ModerationOutcome;
  };

  public type Post = {
    id : Nat;
    author : Principal;
    authorName : ?Text;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    video : ?Storage.ExternalBlob;
  };

  public type Event = {
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

  public type GalleryMediaItem = {
    id : Nat;
    author : Principal;
    mediaType : {
      #image;
      #video;
    };
    createdAt : Time.Time;
    blob : Storage.ExternalBlob;
    title : ?Text;
    description : ?Text;
  };

  public type Comment = {
    postId : Nat;
    author : Principal;
    authorName : ?Text;
    content : Text;
    createdAt : Time.Time;
  };

  public type PollOption = {
    optionId : Nat;
    text : Text;
  };

  public type Poll = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
  };

  public type PollWithResults = {
    pollId : Nat;
    question : Text;
    options : [PollOption];
    createdBy : Principal;
    createdAt : Time.Time;
    isActive : Bool;
    results : [(Nat, Nat)];
  };

  type OldActor = {
    supporterRequests : Map.Map<Principal, SupporterRequest>;
    supporters : Map.Map<Principal, SupporterProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextPostId : Nat;
    posts : Map.Map<Nat, Post>;
    events : Map.Map<Nat, Event>;
    nextEventId : Nat;
    moderationQueue : Map.Map<Nat, ModeratedContent>;
    comments : Map.Map<Nat, List.List<Comment>>;
    postLikes : Map.Map<Nat, List.List<Principal>>;
    profileLikes : Map.Map<Principal, List.List<Principal>>;
    polls : Map.Map<Nat, Poll>;
    votes : Map.Map<Nat, List.List<(Principal, Nat)>>;
    nextPollId : Nat;
    galleryMediaItems : List.List<{
      author : Principal;
      mediaType : {
        #image;
        #video;
      };
      createdAt : Time.Time;
      blob : Storage.ExternalBlob;
      title : ?Text;
      description : ?Text;
    }>;
  };

  type NewActor = {
    supporterRequests : Map.Map<Principal, SupporterRequest>;
    supporters : Map.Map<Principal, SupporterProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextPostId : Nat;
    posts : Map.Map<Nat, Post>;
    events : Map.Map<Nat, Event>;
    nextEventId : Nat;
    moderationQueue : Map.Map<Nat, ModeratedContent>;
    comments : Map.Map<Nat, List.List<Comment>>;
    postLikes : Map.Map<Nat, List.List<Principal>>;
    profileLikes : Map.Map<Principal, List.List<Principal>>;
    polls : Map.Map<Nat, Poll>;
    votes : Map.Map<Nat, List.List<(Principal, Nat)>>;
    nextPollId : Nat;
    nextGalleryMediaId : Nat;
    galleryMediaItems : Map.Map<Nat, GalleryMediaItem>;
  };

  public func run(old : OldActor) : NewActor {
    let convertedGalleryItems = Map.fromIter<Nat, GalleryMediaItem>(old.galleryMediaItems.toArray().enumerate().map(func((index, oldItem)) { (index, { oldItem with id = index }) }));

    {
      old with
      nextGalleryMediaId = convertedGalleryItems.size();
      galleryMediaItems = convertedGalleryItems;
    };
  };
};

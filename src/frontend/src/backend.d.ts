import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfileEdit {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export type Time = bigint;
export interface LegacyPost {
    id: bigint;
    title: string;
    body: string;
    createdAt: Time;
    authorName?: string;
    author: Principal;
    image?: ImageAttachment;
}
export interface Event {
    id: bigint;
    startTime: Time;
    title: string;
    endTime: Time;
    createdAt: Time;
    authorName?: string;
    description: string;
    author: Principal;
    location: string;
}
export interface Link {
    url: string;
    displayName: string;
}
export interface ImageAttachment {
    contentType: string;
    bytes: Uint8Array;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    plushieImages: Array<ExternalBlob>;
    links: Array<Link>;
    publicDirectory: boolean;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(authorName: string | null, title: string, description: string, location: string, startTime: Time, endTime: Time): Promise<bigint>;
    createPost(authorName: string | null, title: string, body: string, imageBytes: Uint8Array | null, imageContentType: string | null): Promise<bigint>;
    deletePost(id: bigint): Promise<void>;
    editPost(id: bigint, newTitle: string, newBody: string, newAuthorName: string | null): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(id: bigint): Promise<Event>;
    getPost(id: bigint): Promise<LegacyPost>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDirectoryProfiles(): Promise<Array<UserProfile>>;
    listEvents(): Promise<Array<Event>>;
    listPosts(): Promise<Array<LegacyPost>>;
    saveCallerUserProfile(profileEdit: UserProfileEdit): Promise<void>;
}

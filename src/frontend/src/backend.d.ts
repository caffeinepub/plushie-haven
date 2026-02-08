import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Post {
    id: bigint;
    title: string;
    body: string;
    createdAt: Time;
    authorName?: string;
    author: Principal;
}
export type Time = bigint;
export interface backendInterface {
    createPost(authorName: string | null, title: string, body: string): Promise<bigint>;
    getPost(id: bigint): Promise<Post>;
    listPosts(): Promise<Array<Post>>;
}

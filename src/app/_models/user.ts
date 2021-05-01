import { Role } from "./role";

export class User {
    id?: number;
    firstname: string;
    lastname: string;
    username: string;
    role: Role;
    token?: string;
    renewableToken?: string;
}
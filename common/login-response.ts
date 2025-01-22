import { IUser } from "./user";

export interface LoginResponse {
    token?: string;
    user?: IUser;
    message?: string;
    isLanguageFrench?: boolean;
    isThemeDark?: boolean;
}
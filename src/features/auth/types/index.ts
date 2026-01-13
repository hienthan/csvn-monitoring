export interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  dept: string;
  syno_username?: string | null;
  token?: string | null;
  session_token?: string;
  [key: string]: any; // To accommodate other fields from the API
}

export interface LoginResponse extends UserProfile {}

export interface LoginCredentials {
  username: string;
  password: string;
  app: string;
}

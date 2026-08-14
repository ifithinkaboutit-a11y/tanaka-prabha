export interface Village {
  en: string;
  hi: string;
}

export interface PostOffice {
  en: string;
  hi: string;
}

export interface GramPanchayat {
  en: string;
  hi: string;
  villages: Village[];
  postOffices: PostOffice[];
}

export interface NyayPanchayat {
  en: string;
  hi: string;
  gramPanchayats: GramPanchayat[];
}

export interface Tehsil {
  en: string;
  hi: string;
  nyayPanchayats: NyayPanchayat[];
}

export type DistrictHierarchy = Tehsil[];

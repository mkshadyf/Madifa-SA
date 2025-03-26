declare module '@vimeo/vimeo' {
  export class Vimeo {
    constructor(
      clientId: string,
      clientSecret: string,
      accessToken: string | null
    );

    request(
      options: {
        method: string;
        path: string;
        query?: Record<string, any>;
        headers?: Record<string, string>;
        body?: any;
      },
      callback: (error: any, body: any, statusCode?: number, headers?: Record<string, string>) => void
    ): void;

    upload(
      file: string,
      options: {
        name: string;
        description?: string;
        privacy?: {
          view: 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted';
          embed: 'public' | 'private' | 'whitelist';
          download: boolean;
          add: boolean;
        };
        folder_id?: number;
        [key: string]: any;
      },
      completeCallback: (uri: string) => void,
      progressCallback: (bytesUploaded: number, bytesTotal: number) => void,
      errorCallback: (error: any) => void
    ): void;
  }
}
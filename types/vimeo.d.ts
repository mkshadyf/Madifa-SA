declare module '@vimeo/vimeo' {
  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string);
    
    request(
      url: string | { method: string; path: string; query?: any; headers?: any; }, 
      callback: (error: any, body: any, statusCode?: number, headers?: any) => void, 
      method?: string, 
      body?: any
    ): void;
    
    upload(
      filePath: string, 
      params: any, 
      completeCallback: (error: any, body: any, statusCode?: number, headers?: any) => void,
      progressCallback?: (bytesUploaded: any, bytesTotal: any) => void,
      errorCallback?: (error: any) => void
    ): void;
    
    streamingUpload(
      filePath: string, 
      params: any, 
      callback: (error: any, body: any, statusCode?: number, headers?: any) => void
    ): void;
  }
}